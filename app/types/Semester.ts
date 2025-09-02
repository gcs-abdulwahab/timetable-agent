

import { Degree } from '../types/Degree';
export interface Semester {
  id: number;
  name: string;
  isActive: boolean;
  degreeId: number;
  degree?: Degree;
}
