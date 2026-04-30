// types/attendance.ts
export type AttendanceStatus = 'present' | 'absent' | 'not-marked' | 'half-day' | 'leave' | 'no-record' | 'checked-in';

export interface AttendanceRecord {
  _id?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  duration?: number;
  workingHours?: number;
  employee?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  total: number;
  percentage: number;
  totalHours: number;
  remainingMins: number;
  lateArrivals?: number;
  earlyDepartures?: number;
  workingDays?: number;
}

export interface AttendanceFilters {
  status?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}