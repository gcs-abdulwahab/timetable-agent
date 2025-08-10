import { z } from 'zod';

// Subject interface with all required fields and optional fields for backward compatibility
export interface Subject {
  id: string;
  name: string;
  shortName: string;
  code: string; // Course code like CS-101, MATH-201, etc.
  creditHours: number;
  color: string;
  departmentId: string; // Department that offers this subject in their curriculum
  semesterLevel: number; // 1-8 for BS programs
  isCore: boolean; // Core vs Elective
  semesterId: string; // Which semester this subject is offered in
  // Optional fields to preserve existing data shape
  isMajor?: boolean; // Major (taught by same department) vs Minor (taught by other departments)
  teachingDepartmentIds?: string[]; // Department(s) that actually teach this subject
}

// Zod schema for Subject with proper coercions
export const SubjectSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required"),
  code: z.string().min(1, "Code is required"),
  creditHours: z.coerce.number().int().min(1, "Credit hours must be at least 1").max(10, "Credit hours cannot exceed 10"),
  color: z.string().min(1, "Color is required").regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex color"),
  departmentId: z.string().min(1, "Department ID is required"),
  semesterLevel: z.coerce.number().int().min(1, "Semester level must be at least 1").max(8, "Semester level cannot exceed 8"),
  isCore: z.coerce.boolean(),
  semesterId: z.string().min(1, "Semester ID is required"),
  // Optional fields with default values for backward compatibility
  isMajor: z.coerce.boolean().optional().default(true),
  teachingDepartmentIds: z.array(z.string()).optional().default([])
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
