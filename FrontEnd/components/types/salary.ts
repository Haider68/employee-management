// types/salary.ts

export interface BonusDetail {
  reason: string;
  amount: number;
}

export interface SalaryRecord {
  _id: string;
  employee: any; // Can be string or Employee object if populated
  month: number;
  year: number;
  baseSalary: number;
  totalWorkedHours: number;
  requiredHours: number;
  
  // Deductions
  shortageHours: number;
  deductionAmount: number;
  
  // Overtime
  overtimeHours: number;
  overtimePay: number;
  
  // Bonuses
  bonusesAmount: number;
  bonusesDetails: BonusDetail[];
  
  // Final Calculation
  netSalary: number;
  status: 'pending' | 'paid';
  paidAt?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryFilters {
  employeeId?: string;
  month?: number;
  year?: number;
  status?: 'pending' | 'paid';
}