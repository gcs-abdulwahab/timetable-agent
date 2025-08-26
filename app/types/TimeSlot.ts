export interface TimeSlot {
  id: number;
  start: string;  // HH:mm format
  end: string;    // HH:mm format
  period: number;
  // type: string;   // 'BS' or 'Inter'
  programId?: number;
}
