import { Subject } from '../../types/subject';
import { generateSubjectId } from './subjectImportUtils';
import { ValidatedRow } from './validateSubjects';

/**
 * Resolution choice for conflicts
 */
export type ResolutionChoice = 'skip' | 'overwrite' | 'keep_both';

/**
 * Import row with resolution information
 */
export interface ImportRow {
  validatedRow: ValidatedRow;
  resolution: ResolutionChoice;
  includeInImport: boolean;
}

/**
 * Outcome for a single row import
 */
export interface RowOutcome {
  rowIndex: number;
  status: 'imported' | 'updated' | 'skipped' | 'failed';
  reason: string;
  subjectId?: string;
  originalData: Subject;
}

/**
 * Complete import result
 */
export interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  rowOutcomes: RowOutcome[];
  finalCounts: {
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
    totalSubjects: number;
  };
  errors: string[];
}

/**
 * Maps for fast subject lookups
 */
interface SubjectMaps {
  byId: Map<string, Subject>;
  byCode: Map<string, Subject>;
}

/**
 * Fetch existing subjects from the API
 */
async function fetchExistingSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch('/api/subjects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch existing subjects: ${response.status} ${response.statusText}`);
    }

    const subjects = await response.json();
    return Array.isArray(subjects) ? subjects : [];
  } catch (error) {
    console.error('Error fetching existing subjects:', error);
    throw new Error(`Failed to fetch existing subjects: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build lookup maps from existing subjects
 */
function buildSubjectMaps(existingSubjects: Subject[]): SubjectMaps {
  const byId = new Map<string, Subject>();
  const byCode = new Map<string, Subject>();

  for (const subject of existingSubjects) {
    // Use case-insensitive keys for better matching
    const idKey = subject.id.toLowerCase().trim();
    const codeKey = subject.code.toLowerCase().trim();

    byId.set(idKey, subject);
    byCode.set(codeKey, subject);
  }

  return { byId, byCode };
}

/**
 * De-duplicate teachingDepartmentIds array while preserving order
 */
function deduplicateTeachingDepartments(ids: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of ids) {
    if (id && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }

  return result;
}

/**
 * Merge subject data, preserving isMajor when present and de-duplicating teachingDepartmentIds
 */
function mergeSubjectData(newSubject: Subject, existingSubject?: Subject): Subject {
  const merged = { ...newSubject };

  if (existingSubject) {
    // Preserve isMajor from existing if new subject doesn't specify it
    if (existingSubject.isMajor !== undefined && newSubject.isMajor === undefined) {
      merged.isMajor = existingSubject.isMajor;
    }

    // Merge teachingDepartmentIds and deduplicate
    const existingDepts = existingSubject.teachingDepartmentIds || [];
    const newDepts = newSubject.teachingDepartmentIds || [];
    const combinedDepts = [...existingDepts, ...newDepts];
    
    if (combinedDepts.length > 0) {
      merged.teachingDepartmentIds = deduplicateTeachingDepartments(combinedDepts);
    }
  } else {
    // For new subjects, just deduplicate if teachingDepartmentIds is present
    if (merged.teachingDepartmentIds && merged.teachingDepartmentIds.length > 0) {
      merged.teachingDepartmentIds = deduplicateTeachingDepartments(merged.teachingDepartmentIds);
    }
  }

  return merged;
}

/**
 * Process import rows and build final subjects array
 */
function processImportRows(
  importRows: ImportRow[],
  subjectMaps: SubjectMaps,
  existingSubjects: Subject[]
): { finalSubjects: Subject[]; rowOutcomes: RowOutcome[] } {
  const finalSubjects: Subject[] = [...existingSubjects];
  const rowOutcomes: RowOutcome[] = [];
  
  // Keep track of subjects that have been modified to avoid duplicates
  const modifiedSubjectIds = new Set<string>();

  for (const importRow of importRows) {
    const { validatedRow, resolution, includeInImport } = importRow;
    const subject = validatedRow.data;
    const rowIndex = validatedRow.rowIndex;

    // Skip if not included in import
    if (!includeInImport) {
      rowOutcomes.push({
        rowIndex,
        status: 'skipped',
        reason: 'Excluded from import by user selection',
        originalData: subject,
      });
      continue;
    }

    // Skip resolution
    if (resolution === 'skip') {
      rowOutcomes.push({
        rowIndex,
        status: 'skipped',
        reason: 'Skipped due to conflict resolution choice',
        originalData: subject,
      });
      continue;
    }

    const subjectIdKey = subject.id.toLowerCase().trim();
    const subjectCodeKey = subject.code.toLowerCase().trim();
    const existingById = subjectMaps.byId.get(subjectIdKey);
    const existingByCode = subjectMaps.byCode.get(subjectCodeKey);

    try {
      if (resolution === 'overwrite') {
        // Overwrite: replace matching by id; if conflict by code only, update that record
        if (existingById) {
          // Found exact ID match - replace it
          const existingIndex = finalSubjects.findIndex(s => s.id.toLowerCase().trim() === subjectIdKey);
          if (existingIndex !== -1 && !modifiedSubjectIds.has(existingById.id)) {
            const mergedSubject = mergeSubjectData(subject, existingById);
            finalSubjects[existingIndex] = mergedSubject;
            modifiedSubjectIds.add(existingById.id);
            
            rowOutcomes.push({
              rowIndex,
              status: 'updated',
              reason: 'Overwrote existing subject with matching ID',
              subjectId: mergedSubject.id,
              originalData: subject,
            });
          } else {
            rowOutcomes.push({
              rowIndex,
              status: 'failed',
              reason: 'Subject with this ID was already modified in this import',
              originalData: subject,
            });
          }
        } else if (existingByCode) {
          // Found code conflict but no ID match - update the existing record
          const existingIndex = finalSubjects.findIndex(s => s.code.toLowerCase().trim() === subjectCodeKey);
          if (existingIndex !== -1 && !modifiedSubjectIds.has(existingByCode.id)) {
            const mergedSubject = mergeSubjectData(subject, existingByCode);
            // Keep the original ID but update with new data
            mergedSubject.id = existingByCode.id;
            finalSubjects[existingIndex] = mergedSubject;
            modifiedSubjectIds.add(existingByCode.id);
            
            rowOutcomes.push({
              rowIndex,
              status: 'updated',
              reason: 'Updated existing subject with matching code',
              subjectId: mergedSubject.id,
              originalData: subject,
            });
          } else {
            rowOutcomes.push({
              rowIndex,
              status: 'failed',
              reason: 'Subject with this code was already modified in this import',
              originalData: subject,
            });
          }
        } else {
          // No conflicts - add as new subject
          const mergedSubject = mergeSubjectData(subject);
          finalSubjects.push(mergedSubject);
          
          rowOutcomes.push({
            rowIndex,
            status: 'imported',
            reason: 'Added as new subject (no conflicts)',
            subjectId: mergedSubject.id,
            originalData: subject,
          });
        }
      } else if (resolution === 'keep_both') {
        // Keep both: ensure unique id using generateSubjectId and insert
        let newSubject = { ...subject };
        
        // Generate new unique ID if there's any conflict
        if (existingById || existingByCode) {
          newSubject.id = generateSubjectId();
        }
        
        const mergedSubject = mergeSubjectData(newSubject);
        finalSubjects.push(mergedSubject);
        
        rowOutcomes.push({
          rowIndex,
          status: 'imported',
          reason: existingById || existingByCode 
            ? 'Added as new subject with generated ID to avoid conflicts'
            : 'Added as new subject',
          subjectId: mergedSubject.id,
          originalData: subject,
        });
      }
    } catch (error) {
      rowOutcomes.push({
        rowIndex,
        status: 'failed',
        reason: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        originalData: subject,
      });
    }
  }

  return { finalSubjects, rowOutcomes };
}

/**
 * Save subjects array to API
 */
async function saveSubjectsToAPI(subjects: Subject[]): Promise<void> {
  const response = await fetch('/api/subjects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subjects),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to save subjects (${response.status}): ${errorText}`);
  }
}

/**
 * Main import execution function
 */
export async function executeImport(importRows: ImportRow[]): Promise<ImportResult> {
  const errors: string[] = [];
  let finalSubjects: Subject[] = [];
  let rowOutcomes: RowOutcome[] = [];

  try {
    // Step 1: Fetch existing subjects via GET api/subjects
    const existingSubjects = await fetchExistingSubjects();

    // Step 2: Build maps by id and by code for fast lookup
    const subjectMaps = buildSubjectMaps(existingSubjects);

    // Step 3: Process each validated row selected for import
    const processingResult = processImportRows(importRows, subjectMaps, existingSubjects);
    finalSubjects = processingResult.finalSubjects;
    rowOutcomes = processingResult.rowOutcomes;

    // Step 4: POST finalSubjects to api/subjects
    try {
      await saveSubjectsToAPI(finalSubjects);
    } catch (saveError) {
      errors.push(`Failed to save subjects: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
      
      return {
        success: false,
        totalRows: importRows.length,
        processedRows: 0,
        rowOutcomes,
        finalCounts: {
          imported: 0,
          updated: 0,
          skipped: rowOutcomes.filter(r => r.status === 'skipped').length,
          failed: rowOutcomes.length,
          totalSubjects: existingSubjects.length,
        },
        errors,
      };
    }

    // Step 5: Calculate final counts and return ImportResult
    const imported = rowOutcomes.filter(r => r.status === 'imported').length;
    const updated = rowOutcomes.filter(r => r.status === 'updated').length;
    const skipped = rowOutcomes.filter(r => r.status === 'skipped').length;
    const failed = rowOutcomes.filter(r => r.status === 'failed').length;
    const processedRows = imported + updated;

    return {
      success: true,
      totalRows: importRows.length,
      processedRows,
      rowOutcomes,
      finalCounts: {
        imported,
        updated,
        skipped,
        failed,
        totalSubjects: finalSubjects.length,
      },
      errors,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    errors.push(errorMessage);

    // Return failed result with whatever outcomes we managed to process
    return {
      success: false,
      totalRows: importRows.length,
      processedRows: 0,
      rowOutcomes,
      finalCounts: {
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: importRows.length,
        totalSubjects: 0,
      },
      errors,
    };
  }
}

/**
 * Utility function to create ImportRow from validated data
 */
export function createImportRow(
  validatedRow: ValidatedRow,
  resolution: ResolutionChoice = 'overwrite',
  includeInImport: boolean = true
): ImportRow {
  return {
    validatedRow,
    resolution,
    includeInImport,
  };
}

/**
 * Helper function to format import results for display
 */
export function formatImportResults(result: ImportResult): string {
  if (!result.success) {
    return `Import failed: ${result.errors.join(', ')}`;
  }

  const { finalCounts } = result;
  const lines = [
    `Import completed successfully!`,
    `Total processed: ${result.processedRows}/${result.totalRows} rows`,
    `- Imported: ${finalCounts.imported} new subjects`,
    `- Updated: ${finalCounts.updated} existing subjects`,
    `- Skipped: ${finalCounts.skipped} subjects`,
    `- Failed: ${finalCounts.failed} subjects`,
    `Total subjects in database: ${finalCounts.totalSubjects}`,
  ];

  if (result.errors.length > 0) {
    lines.push(`Warnings: ${result.errors.join(', ')}`);
  }

  return lines.join('\n');
}
