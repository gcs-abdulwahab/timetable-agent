import { Subject } from '../../types/subject';

/**
 * Types of conflicts that can be detected
 */
export type ConflictType = 'none' | 'duplicateId' | 'duplicateCode' | 'both';

/**
 * Resolution strategies for different conflict types
 */
export type ResolutionStrategy = 'overwrite' | 'skip' | 'rename' | 'userDecision';

/**
 * Reference to an existing subject that conflicts
 */
export interface ConflictReference {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  semesterId: string;
}

/**
 * Detailed conflict information for a single row
 */
export interface ConflictReport {
  rowIndex: number;
  conflictType: ConflictType;
  hasIdConflict: boolean;
  hasCodeConflict: boolean;
  existingSubjectsByIdConflict: ConflictReference[];
  existingSubjectsByCodeConflict: ConflictReference[];
  intraFileIdConflicts: number[]; // Row indices that have the same ID
  intraFileCodeConflicts: number[]; // Row indices that have the same code
  recommendedResolution: ResolutionStrategy;
  subject: Subject; // The subject being imported
}

/**
 * Global conflict resolution strategy
 */
export interface GlobalResolutionStrategy {
  duplicateIdStrategy: ResolutionStrategy;
  duplicateCodeStrategy: ResolutionStrategy;
  applyToAll: boolean;
}

/**
 * Complete conflict detection result
 */
export interface ConflictDetectionResult {
  totalRows: number;
  conflictingRows: number;
  conflictFreeRows: number;
  conflictReports: ConflictReport[];
  globalStrategy: GlobalResolutionStrategy;
  summary: {
    idConflicts: number;
    codeConflicts: number;
    bothConflicts: number;
    intraFileIdDuplicates: number;
    intraFileCodeDuplicates: number;
    existingDataIdConflicts: number;
    existingDataCodeConflicts: number;
  };
}

/**
 * Fetch existing subjects from the API
 */
export async function fetchExistingSubjects(): Promise<Subject[]> {
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
 * Create a conflict reference from a subject
 */
function createConflictReference(subject: Subject): ConflictReference {
  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    departmentId: subject.departmentId,
    semesterId: subject.semesterId,
  };
}

/**
 * Detect intra-file duplicates by ID
 */
function detectIntraFileIdDuplicates(subjects: Subject[]): Map<string, number[]> {
  const idMap = new Map<string, number[]>();
  
  subjects.forEach((subject, index) => {
    const id = subject.id.toLowerCase().trim();
    if (!idMap.has(id)) {
      idMap.set(id, []);
    }
    idMap.get(id)!.push(index);
  });

  // Filter out single occurrences
  const duplicates = new Map<string, number[]>();
  idMap.forEach((indices, id) => {
    if (indices.length > 1) {
      duplicates.set(id, indices);
    }
  });

  return duplicates;
}

/**
 * Detect intra-file duplicates by code
 */
function detectIntraFileCodeDuplicates(subjects: Subject[]): Map<string, number[]> {
  const codeMap = new Map<string, number[]>();
  
  subjects.forEach((subject, index) => {
    const code = subject.code.toLowerCase().trim();
    if (!codeMap.has(code)) {
      codeMap.set(code, []);
    }
    codeMap.get(code)!.push(index);
  });

  // Filter out single occurrences
  const duplicates = new Map<string, number[]>();
  codeMap.forEach((indices, code) => {
    if (indices.length > 1) {
      duplicates.set(code, indices);
    }
  });

  return duplicates;
}

/**
 * Detect conflicts with existing dataset by ID
 */
function detectExistingIdConflicts(subjects: Subject[], existingSubjects: Subject[]): Map<string, ConflictReference[]> {
  const existingIdMap = new Map<string, ConflictReference[]>();
  
  // Build map of existing subjects by ID
  existingSubjects.forEach(existing => {
    const id = existing.id.toLowerCase().trim();
    if (!existingIdMap.has(id)) {
      existingIdMap.set(id, []);
    }
    existingIdMap.get(id)!.push(createConflictReference(existing));
  });

  // Check for conflicts
  const conflicts = new Map<string, ConflictReference[]>();
  subjects.forEach(subject => {
    const id = subject.id.toLowerCase().trim();
    if (existingIdMap.has(id)) {
      conflicts.set(subject.id, existingIdMap.get(id)!);
    }
  });

  return conflicts;
}

/**
 * Detect conflicts with existing dataset by code
 */
function detectExistingCodeConflicts(subjects: Subject[], existingSubjects: Subject[]): Map<string, ConflictReference[]> {
  const existingCodeMap = new Map<string, ConflictReference[]>();
  
  // Build map of existing subjects by code
  existingSubjects.forEach(existing => {
    const code = existing.code.toLowerCase().trim();
    if (!existingCodeMap.has(code)) {
      existingCodeMap.set(code, []);
    }
    existingCodeMap.get(code)!.push(createConflictReference(existing));
  });

  // Check for conflicts
  const conflicts = new Map<string, ConflictReference[]>();
  subjects.forEach(subject => {
    const code = subject.code.toLowerCase().trim();
    if (existingCodeMap.has(code)) {
      conflicts.set(subject.code, existingCodeMap.get(code)!);
    }
  });

  return conflicts;
}

/**
 * Determine conflict type based on detected conflicts
 */
function determineConflictType(hasIdConflict: boolean, hasCodeConflict: boolean): ConflictType {
  if (hasIdConflict && hasCodeConflict) return 'both';
  if (hasIdConflict) return 'duplicateId';
  if (hasCodeConflict) return 'duplicateCode';
  return 'none';
}

/**
 * Get recommended resolution strategy based on conflict type
 */
function getRecommendedResolution(conflictType: ConflictType): ResolutionStrategy {
  switch (conflictType) {
    case 'duplicateId':
      return 'overwrite'; // Default: overwrite existing data when ID matches
    case 'duplicateCode':
      return 'skip'; // Default: skip import when code matches (preserve existing)
    case 'both':
      return 'userDecision'; // Let user decide when both ID and code conflict
    case 'none':
    default:
      return 'overwrite'; // No conflict, proceed with import
  }
}

/**
 * Main conflict detection function
 */
export async function detectConflicts(
  subjectsToImport: Subject[],
  existingSubjects?: Subject[]
): Promise<ConflictDetectionResult> {
  // Fetch existing subjects if not provided
  const existing = existingSubjects || await fetchExistingSubjects();

  // Detect intra-file duplicates
  const intraFileIdDuplicates = detectIntraFileIdDuplicates(subjectsToImport);
  const intraFileCodeDuplicates = detectIntraFileCodeDuplicates(subjectsToImport);

  // Detect conflicts with existing data
  const existingIdConflicts = detectExistingIdConflicts(subjectsToImport, existing);
  const existingCodeConflicts = detectExistingCodeConflicts(subjectsToImport, existing);

  // Build conflict reports for each row
  const conflictReports: ConflictReport[] = subjectsToImport.map((subject, index) => {
    const subjectId = subject.id.toLowerCase().trim();
    const subjectCode = subject.code.toLowerCase().trim();

    // Check for intra-file conflicts
    const intraFileIdConflict = intraFileIdDuplicates.has(subjectId);
    const intraFileCodeConflict = intraFileCodeDuplicates.has(subjectCode);

    // Check for existing data conflicts
    const existingIdConflict = existingIdConflicts.has(subject.id);
    const existingCodeConflict = existingCodeConflicts.has(subject.code);

    // Determine overall conflict status
    const hasIdConflict = intraFileIdConflict || existingIdConflict;
    const hasCodeConflict = intraFileCodeConflict || existingCodeConflict;
    const conflictType = determineConflictType(hasIdConflict, hasCodeConflict);

    // Get conflicting row indices (excluding current row)
    const intraFileIdConflictIndices = intraFileIdDuplicates.get(subjectId)?.filter(i => i !== index) || [];
    const intraFileCodeConflictIndices = intraFileCodeDuplicates.get(subjectCode)?.filter(i => i !== index) || [];

    // Get existing subject references
    const existingByIdConflict = existingIdConflicts.get(subject.id) || [];
    const existingByCodeConflict = existingCodeConflicts.get(subject.code) || [];

    return {
      rowIndex: index,
      conflictType,
      hasIdConflict,
      hasCodeConflict,
      existingSubjectsByIdConflict: existingByIdConflict,
      existingSubjectsByCodeConflict: existingByCodeConflict,
      intraFileIdConflicts: intraFileIdConflictIndices,
      intraFileCodeConflicts: intraFileCodeConflictIndices,
      recommendedResolution: getRecommendedResolution(conflictType),
      subject,
    };
  });

  // Calculate summary statistics
  const conflictingRows = conflictReports.filter(report => report.conflictType !== 'none').length;
  const conflictFreeRows = conflictReports.length - conflictingRows;

  const summary = {
    idConflicts: conflictReports.filter(r => r.hasIdConflict).length,
    codeConflicts: conflictReports.filter(r => r.hasCodeConflict).length,
    bothConflicts: conflictReports.filter(r => r.conflictType === 'both').length,
    intraFileIdDuplicates: Array.from(intraFileIdDuplicates.values()).reduce((sum, indices) => sum + indices.length, 0),
    intraFileCodeDuplicates: Array.from(intraFileCodeDuplicates.values()).reduce((sum, indices) => sum + indices.length, 0),
    existingDataIdConflicts: conflictReports.filter(r => r.existingSubjectsByIdConflict.length > 0).length,
    existingDataCodeConflicts: conflictReports.filter(r => r.existingSubjectsByCodeConflict.length > 0).length,
  };

  // Define default global resolution strategy
  const globalStrategy: GlobalResolutionStrategy = {
    duplicateIdStrategy: 'overwrite',
    duplicateCodeStrategy: 'skip',
    applyToAll: false,
  };

  return {
    totalRows: subjectsToImport.length,
    conflictingRows,
    conflictFreeRows,
    conflictReports,
    globalStrategy,
    summary,
  };
}

/**
 * Apply resolution strategy to conflicts
 */
export function applyResolutionStrategy(
  conflictReports: ConflictReport[],
  globalStrategy: GlobalResolutionStrategy
): { toImport: Subject[]; toSkip: ConflictReport[]; toOverwrite: ConflictReport[] } {
  const toImport: Subject[] = [];
  const toSkip: ConflictReport[] = [];
  const toOverwrite: ConflictReport[] = [];

  conflictReports.forEach(report => {
    let strategy = report.recommendedResolution;

    // Apply global strategy if enabled
    if (globalStrategy.applyToAll) {
      if (report.hasIdConflict) {
        strategy = globalStrategy.duplicateIdStrategy;
      } else if (report.hasCodeConflict) {
        strategy = globalStrategy.duplicateCodeStrategy;
      }
    }

    switch (strategy) {
      case 'overwrite':
        toImport.push(report.subject);
        toOverwrite.push(report);
        break;
      case 'skip':
        toSkip.push(report);
        break;
      case 'userDecision':
      case 'rename':
      default:
        // For now, treat these as skip until user makes decision
        toSkip.push(report);
        break;
    }
  });

  return { toImport, toSkip, toOverwrite };
}

/**
 * Format conflict report for display
 */
export function formatConflictReport(report: ConflictReport): string {
  const lines: string[] = [];
  lines.push(`Row ${report.rowIndex + 1}: ${report.subject.name} (${report.subject.code})`);

  if (report.conflictType === 'none') {
    lines.push('  ✓ No conflicts detected');
    return lines.join('\n');
  }

  if (report.hasIdConflict) {
    if (report.intraFileIdConflicts.length > 0) {
      const rows = report.intraFileIdConflicts.map(i => i + 1).join(', ');
      lines.push(`  ⚠ Duplicate ID within file (rows: ${rows})`);
    }
    if (report.existingSubjectsByIdConflict.length > 0) {
      const existing = report.existingSubjectsByIdConflict.map(e => `${e.name} (${e.code})`).join(', ');
      lines.push(`  ⚠ ID conflicts with existing: ${existing}`);
    }
  }

  if (report.hasCodeConflict) {
    if (report.intraFileCodeConflicts.length > 0) {
      const rows = report.intraFileCodeConflicts.map(i => i + 1).join(', ');
      lines.push(`  ⚠ Duplicate code within file (rows: ${rows})`);
    }
    if (report.existingSubjectsByCodeConflict.length > 0) {
      const existing = report.existingSubjectsByCodeConflict.map(e => `${e.name} (${e.code})`).join(', ');
      lines.push(`  ⚠ Code conflicts with existing: ${existing}`);
    }
  }

  lines.push(`  → Recommended action: ${report.recommendedResolution}`);

  return lines.join('\n');
}

/**
 * Export all types and utilities
 */
export type {
  ConflictType,
  ResolutionStrategy,
  ConflictReference,
  ConflictReport,
  GlobalResolutionStrategy,
  ConflictDetectionResult,
};
