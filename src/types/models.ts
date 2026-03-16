export interface Worker {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string;
  entryTime: string | null;
  exitTime: string | null;
}
