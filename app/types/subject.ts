import { z } from 'zod';

// Subject interface with all required fields and optional fields for backward compatibility
export interface Subject {
  id: number;
  name: string;
  shortName?: string; // Made optional since it was removed from data
  code: string; // Course code like CS-101, MATH-201, etc.
  creditHours: number;
  departmentId: number; // Department that offers this subject in their curriculum
  // semesterLevel removed: not required in model
  isCore?: boolean; // Core vs Elective (optional; isMajor preferred)
  semesterId?: number; // Which semester this subject is offered in (numeric id)
  // Optional fields to preserve existing data shape
  isMajor?: boolean; // Major (taught by same department) vs Minor (taught by other departments)
  teachingDepartmentIds?: number[]; // Department(s) that actually teach this subject (numeric ids)
  subjectDepartments?: number[]; // Departments for non-core subject (from DB)
}

// Zod schema for Subject with proper coercions
export const SubjectSchema = z.object({
  id: z.coerce.number().int().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required"),
  code: z.string().min(1, "Code is required"),
  creditHours: z.coerce.number().int().min(1, "Credit hours must be at least 1").max(10, "Credit hours cannot exceed 10"),
  departmentId: z.coerce.number().int(),
  // semesterLevel removed from schema
  isCore: z.coerce.boolean().optional(),
  semesterId: z.coerce.number().int().optional(),
  // Optional fields with default values for backward compatibility
  isMajor: z.coerce.boolean().optional().default(true),
  teachingDepartmentIds: z.array(z.coerce.number().int()).optional().default([])
});

// Type derived from Zod schema for consistency
export type SubjectInput = z.input<typeof SubjectSchema>;
export type SubjectOutput = z.output<typeof SubjectSchema>;

// Validation helper functions
export const validateSubject = (data: unknown): SubjectOutput => {
  return SubjectSchema.parse(data);
};

export const validateSubjectArray = (data: unknown): SubjectOutput[] => {
  return z.array(SubjectSchema).parse(data);
};

// Partial schema for updates (all fields optional except id)
export const SubjectUpdateSchema = SubjectSchema.partial().required({ id: true });
export type SubjectUpdate = z.infer<typeof SubjectUpdateSchema>;
