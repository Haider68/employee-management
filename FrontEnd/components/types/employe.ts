export interface Avatar {
  public_id: string;
  url: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  employeeId?: string;
  position: string;
  department: string;
  status: 'active' | 'onleave' | 'remote' | 'inactive';
  joinDate: Date | string;
  birthDate?: Date | string;
  salary?: number;
  address?: string;
  avatar?: Avatar | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: 'active' | 'onleave' | 'remote' | 'inactive';
  joinDate: Date | string;
  birthDate?: Date | string;
  salary?: number;
  address?: string;
  avatar?: File | string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export interface DepartmentOption {
  value: string;
  label: string;
}

export interface StatusOption {
  value: 'active' | 'onleave' | 'remote' | 'inactive';
  label: string;
  color: string;
}

export interface Filters {
  department: string;
  status: string;
}