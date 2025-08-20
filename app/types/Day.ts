export interface Day {
  id: number;
  name: string;
  shortName: string;
  dayCode: number;
  isActive: boolean;  
  institutionId?: number;
}
