import { Department } from "./Department";
import { TimeSlot } from "./TimeSlot";


// UI-related types
export type Notification = { message: string; type: 'success' | 'error' } | null;
export type ConflictTooltip = { show: boolean; content: string; x: number; y: number };


export type AddEntryDataForModal = {
    selectedSemesterId: number | null;
    selectedDepartment: Department | null;
    selectedTimeSlot: TimeSlot | null;
    
};
