// types/leave.ts

// Employee interface (simplified for leave requests)
export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  employeeId: string;
}

// Main Leave Request Type Interface
export interface LeaveRequestType {
  _id: string;
  employee: Employee;
  leave_type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'casual' | 'compensatory';
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: Employee;
  approved_at?: string;
  rejection_reason?: string;
  createdAt: string;
  updatedAt: string;
}

// For backward compatibility
export type LeaveRequest = LeaveRequestType;

// Filters for leave requests
export interface LeaveFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  leave_type?: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'casual' | 'compensatory';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  employee_id?: string;
  department?: string;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Paginated Response
export interface PaginatedResponse<T = any> {
  leaveRequests: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// For leave form
export interface CreateLeaveRequestData {
  leave_type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'casual' | 'compensatory';
  start_date: string;
  end_date: string;
  reason: string;
  number_of_days?: number;
}

// For leave statistics
export interface LeaveStatistics {
  year: number;
  statistics: {
    total_requests: number;
    approved: number;
    pending: number;
    rejected: number;
    cancelled: number;
    total_days_taken: number;
    approval_rate: number;
    by_type: Record<string, { count: number; days: number }>;
    by_month: number[];
  };
}

// For leave balance
export interface LeaveBalance {
  employee: {
    id: string;
    name: string;
    department: string;
  };
  year: number;
  total_taken: number;
  balance: Record<string, {
    entitlement: number;
    taken: number;
    balance: number;
  }>;
}