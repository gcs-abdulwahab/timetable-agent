export interface Room {
  id?: number;
  name: string;
  capacity: number;
  type: string;
  building?: string;
  floor?: number;
  hasProjector?: boolean;
  hasAC?: boolean;
  description?: string;
  primaryDepartmentId?: number;
  availableForOtherDepartments?: boolean;
}
