import { z } from 'zod';
import { Subject } from '../../types/subject';

/**
 * Generate a unique subject ID with format: sub + timestamp + random suffix
 * Example: sub1754835936957zbskor
 */
export function generateSubjectId(): string {
  const timestamp = Date.now();
  const randomChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomSuffix = Array.from({ length: 6 }, () =>
    randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  ).join('');
  
  return `sub${timestamp}${randomSuffix}`;
}

/**
 * Default color palette for subjects cycling through blue shades
 */
const DEFAULT_COLOR_PALETTE = [
  'bg-blue-100',
  'bg-blue-150',
  'bg-blue-200',
  'bg-blue-250',
  'bg-blue-300'
];

let colorIndex = 0;

/**
 * Assign a default color from the cycling palette when color is missing
 */
export function assignDefaultColor(color?: string): string {
  if (color && color.trim()) {
    return color.trim();
  }
  
  const defaultColor = DEFAULT_COLOR_PALETTE[colorIndex];
  colorIndex = (colorIndex + 1) % DEFAULT_COLOR_PALETTE.length;
  
  return defaultColor;
}

/**
 * Reset color index (useful for testing or when starting fresh)
 */
export function resetColorIndex(): void {
  colorIndex = 0;
}

/**
 * Extract semester level from semester ID
 * Examples: "sem1" -> 1, "sem3" -> 3, "sem8" -> 8
 */
function extractSemesterLevelFromId(semesterId: string): number | null {
  const match = semesterId.match(/sem(\d+)/);
  if (match && match[1]) {
    const level = parseInt(match[1], 10);
    return level >= 1 && level <= 8 ? level : null;
  }
  return null;
}

/**
 * Normalize subject data by trimming strings, coercing types, and ensuring consistency
 */
export function normalizeSubject(subject: any): Partial<Subject> {
  const normalized: any = {};
  
  // Trim string fields
  if (subject.id !== undefined) {
    normalized.id = typeof subject.id === 'string' ? subject.id.trim() : subject.id;
  }
  if (subject.name !== undefined) {
    normalized.name = typeof subject.name === 'string' ? subject.name.trim() : subject.name;
  }
  if (subject.shortName !== undefined) {
    normalized.shortName = typeof subject.shortName === 'string' ? subject.shortName.trim() : subject.shortName;
  }
  if (subject.code !== undefined) {
    normalized.code = typeof subject.code === 'string' ? subject.code.trim() : subject.code;
  }
  if (subject.departmentId !== undefined) {
    normalized.departmentId = typeof subject.departmentId === 'string' ? subject.departmentId.trim() : subject.departmentId;
  }
  if (subject.semesterId !== undefined) {
    normalized.semesterId = typeof subject.semesterId === 'string' ? subject.semesterId.trim() : subject.semesterId;
  }
  
  // Coerce creditHours to number
  if (subject.creditHours !== undefined) {
    const creditHours = typeof subject.creditHours === 'string' 
      ? parseFloat(subject.creditHours.trim()) 
      : subject.creditHours;
    normalized.creditHours = isNaN(creditHours) ? subject.creditHours : creditHours;
  }
  
  // Coerce isCore to boolean
  if (subject.isCore !== undefined) {
    if (typeof subject.isCore === 'string') {
      const str = subject.isCore.trim().toLowerCase();
      normalized.isCore = str === 'true' || str === '1' || str === 'yes';
    } else if (typeof subject.isCore === 'number') {
      normalized.isCore = subject.isCore !== 0;
    } else {
      normalized.isCore = Boolean(subject.isCore);
    }
  }
  
  // Coerce isMajor to boolean if present
  if (subject.isMajor !== undefined) {
    if (typeof subject.isMajor === 'string') {
      const str = subject.isMajor.trim().toLowerCase();
      normalized.isMajor = str === 'true' || str === '1' || str === 'yes';
    } else if (typeof subject.isMajor === 'number') {
      normalized.isMajor = subject.isMajor !== 0;
    } else {
      normalized.isMajor = Boolean(subject.isMajor);
    }
  }
  
  // Handle semesterLevel and semesterId consistency
  let semesterLevel = subject.semesterLevel;
  let semesterId = normalized.semesterId || subject.semesterId;
  
  // Coerce semesterLevel to number if provided
  if (semesterLevel !== undefined) {
    const level = typeof semesterLevel === 'string' 
      ? parseInt(semesterLevel.trim(), 10) 
      : semesterLevel;
    semesterLevel = isNaN(level) ? subject.semesterLevel : level;
  }
  
  // Infer semesterLevel from semesterId if semesterLevel is missing
  if (semesterLevel === undefined && semesterId) {
    const inferredLevel = extractSemesterLevelFromId(semesterId);
    if (inferredLevel !== null) {
      semesterLevel = inferredLevel;
    }
  }
  
  // Ensure semesterId consistency with semesterLevel if both are provided
  if (semesterLevel !== undefined && semesterId) {
    const expectedSemesterId = `sem${semesterLevel}`;
    const extractedLevel = extractSemesterLevelFromId(semesterId);
    
    // If semesterId doesn't match semesterLevel, prefer semesterLevel
    if (extractedLevel !== semesterLevel) {
      normalized.semesterId = expectedSemesterId;
    }
  }
  
  if (semesterLevel !== undefined) {
    normalized.semesterLevel = semesterLevel;
  }
  
  // Assign color
  normalized.color = assignDefaultColor(subject.color);
  
  // Copy other fields as-is
  Object.keys(subject).forEach(key => {
    if (!(key in normalized)) {
      normalized[key] = subject[key];
    }
  });
  
  return normalized;
}

/**
 * Zod schema for subject validation with clear error messages
 */
export const SubjectSchema = z.object({
  id: z.string()
    .min(1, "Subject ID is required and cannot be empty")
    .trim(),
    
  name: z.string()
    .min(1, "Subject name is required and cannot be empty")
    .max(200, "Subject name cannot exceed 200 characters")
    .trim(),
    
  shortName: z.string()
    .min(1, "Short name is required and cannot be empty")
    .max(50, "Short name cannot exceed 50 characters")
    .trim(),
    
  code: z.string()
    .min(1, "Subject code is required and cannot be empty")
    .max(20, "Subject code cannot exceed 20 characters")
    .trim(),
    
  creditHours: z.coerce.number()
    .int("Credit hours must be a whole number")
    .min(1, "Credit hours must be at least 1")
    .max(10, "Credit hours cannot exceed 10"),
    
  color: z.string()
    .min(1, "Color is required")
    .trim()
    .refine(
      (val) => val.startsWith('bg-') || val.startsWith('#'),
      "Color must be either a Tailwind CSS class (starting with 'bg-') or a hex color (starting with '#')"
    ),
    
  departmentId: z.string()
    .min(1, "Department ID is required and cannot be empty")
    .trim(),
    
  semesterLevel: z.coerce.number()
    .int("Semester level must be a whole number")
    .min(1, "Semester level must be between 1 and 8")
    .max(8, "Semester level must be between 1 and 8"),
    
  isCore: z.coerce.boolean({
    errorMap: () => ({ message: "isCore must be a boolean value (true/false)" })
  }),
  
  semesterId: z.string()
    .min(1, "Semester ID is required and cannot be empty")
    .trim()
    .regex(/^sem[1-8]$/, "Semester ID must be in format 'sem1', 'sem2', ..., 'sem8'"),
    
  // Optional fields for backward compatibility
  isMajor: z.coerce.boolean().optional().default(true),
  teachingDepartmentIds: z.array(z.string()).optional().default([])
})
.refine(
  (data) => {
    // Ensure semesterId and semesterLevel are consistent
    const expectedSemesterId = `sem${data.semesterLevel}`;
    return data.semesterId === expectedSemesterId;
  },
  {
    message: "Semester ID must match semester level (e.g., semesterLevel 3 should have semesterId 'sem3')",
    path: ['semesterId']
  }
);

/**
 * Type definitions for the schema
 */
export type SubjectInput = z.input<typeof SubjectSchema>;
export type SubjectOutput = z.output<typeof SubjectSchema>;

/**
 * Validate a single subject with detailed error reporting
 */
export function validateSubject(data: unknown): SubjectOutput {
  try {
    return SubjectSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('; ');
      throw new Error(`Subject validation failed: ${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Validate an array of subjects
 */
export function validateSubjectArray(data: unknown): SubjectOutput[] {
  if (!Array.isArray(data)) {
    throw new Error('Expected an array of subjects');
  }
  
  const results: SubjectOutput[] = [];
  const errors: string[] = [];
  
  data.forEach((item, index) => {
    try {
      results.push(validateSubject(item));
    } catch (error) {
      errors.push(`Subject ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`Validation failed for ${errors.length} subject(s):\n${errors.join('\n')}`);
  }
  
  return results;
}

/**
 * Safe validation that returns success/error result instead of throwing
 */
export function safeValidateSubject(data: unknown): { success: true; data: SubjectOutput } | { success: false; error: string } {
  try {
    const validated = validateSubject(data);
    return { success: true, data: validated };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Complete subject processing pipeline: normalize, generate ID if missing, and validate
 */
export function processSubjectForImport(rawSubject: any): SubjectOutput {
  // First normalize the subject
  const normalized = normalizeSubject(rawSubject);
  
  // Generate ID if missing
  if (!normalized.id) {
    normalized.id = generateSubjectId();
  }
  
  // Validate and return the processed subject
  return validateSubject(normalized);
}

/**
 * Process multiple subjects for import
 */
export function processSubjectsForImport(rawSubjects: any[]): SubjectOutput[] {
  if (!Array.isArray(rawSubjects)) {
    throw new Error('Expected an array of subjects');
  }
  
  return rawSubjects.map((subject, index) => {
    try {
      return processSubjectForImport(subject);
    } catch (error) {
      throw new Error(`Failed to process subject at index ${index}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}
