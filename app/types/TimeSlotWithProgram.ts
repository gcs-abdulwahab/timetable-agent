import { Program } from './Program';
import { TimeSlot } from './TimeSlot';

export interface TimeSlotWithProgram extends TimeSlot {
  program?: Program;
  programId?: number;
  // type?: string;
}
