import { Program } from '@/app/types/Program';
import { Institution } from './Institution';


export interface Shift {
  id: number;
  name: string;
  institutionId: number;
  institution?: Institution;
  programs?: Program[];
}
