import { z } from 'zod';

// Subject interface with all required fields and optional fields for backward compatibility
export interface Subject {
  id: number;
  name: string;
  shortName?: string;
  code: string;
  creditHours: number;
  degreeId: number; // Degree that offers this subject
  isCore?: boolean;
  semesterId?: number;
  isMajor?: boolean;
  teachingDepartmentIds?: number[];
  subjectDepartments?: number[];
}

// Zod schema for Subject with proper coercions
export const SubjectSchema = z.object({
  id: z.coerce.number().int().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short name is required"),
  code: z.string().min(1, "Code is required"),
  creditHours: z.coerce.number().int().min(1, "Credit hours must be at least 1").max(10, "Credit hours cannot exceed 10"),
  degreeId: z.coerce.number().int(),
  isCore: z.coerce.boolean().optional(),
  semesterId: z.coerce.number().int().optional(),
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
