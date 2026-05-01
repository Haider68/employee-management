import Employee from '../models/employe.js';
import Attendance from '../models/attendence.js';
import SalaryRecord from '../models/SalaryRecord.js';

class SalaryService {
  async calculateMonthlySalary(employeeId, month, year) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // 1. Fetch attendance logic
    // Month is 1-indexed (1-12)
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 1).toISOString();

    const attendances = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate.split('T')[0], $lt: endDate.split('T')[0] },
      status: 'present'
    });

    let totalWorkedHours = 0;

    for (const record of attendances) {
      if (record.checkIn && record.checkOut) {
        const checkInTime = new Date(record.checkIn);
        const checkOutTime = new Date(record.checkOut);
        const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        if (hoursWorked > 0) {
          totalWorkedHours += hoursWorked;
        }
      }
    }

    totalWorkedHours = parseFloat(totalWorkedHours.toFixed(2));

    const requiredHours = employee.requiredHoursPerMonth || 160;
    const baseSalary = employee.salary || 0;
    const hourlyRate = employee.hourlyRate || (baseSalary / requiredHours) || 0;
    const overtimeRate = employee.overtimeRate || (hourlyRate * 1.5);

    let overtimeHours = 0;
    let shortageHours = 0;
    let overtimePay = 0;
    let deductionAmount = 0;

    if (totalWorkedHours > requiredHours) {
      overtimeHours = totalWorkedHours - requiredHours;
      overtimePay = overtimeHours * overtimeRate;
    } else if (totalWorkedHours < requiredHours) {
      shortageHours = requiredHours - totalWorkedHours;
      deductionAmount = shortageHours * hourlyRate;
    }

    // You could fetch bonuses from bonuses/achievements models if they exist.
    let bonusesAmount = 0;
    let bonusesDetails = [];

    const netSalary = baseSalary + overtimePay - deductionAmount + bonusesAmount;

    // Check if record already exists, if so update it, else create
    let salaryRecord = await SalaryRecord.findOne({ employee: employeeId, month, year });

    if (salaryRecord) {
      salaryRecord.totalWorkedHours = totalWorkedHours;
      salaryRecord.requiredHours = requiredHours;
      salaryRecord.shortageHours = shortageHours;
      salaryRecord.deductionAmount = deductionAmount;
      salaryRecord.overtimeHours = overtimeHours;
      salaryRecord.overtimePay = overtimePay;
      salaryRecord.netSalary = netSalary;
      salaryRecord.baseSalary = baseSalary;
      
      await salaryRecord.save();
    } else {
      salaryRecord = new SalaryRecord({
        employee: employeeId,
        month,
        year,
        baseSalary,
        totalWorkedHours,
        requiredHours,
        shortageHours,
        deductionAmount,
        overtimeHours,
        overtimePay,
        bonusesAmount,
        bonusesDetails,
        netSalary,
        status: 'pending'
      });
      await salaryRecord.save();
    }

    return salaryRecord;
  }

  async processAllSalaries(month, year) {
    const employees = await Employee.find({ status: 'active' });
    const records = [];
    for (const emp of employees) {
      try {
        const record = await this.calculateMonthlySalary(emp._id, month, year);
        records.push(record);
      } catch (err) {
        console.error(`Error processing salary for employee ${emp._id}:`, err);
      }
    }
    return records;
  }

  async getSalaryRecords(filters) {
    return await SalaryRecord.find(filters).populate('employee', 'fullName position department');
  }

  async updateSalaryStatus(recordId, status) {
    const record = await SalaryRecord.findById(recordId);
    if (!record) {
      throw new Error('Salary record not found');
    }
    record.status = status;
    if (status === 'paid') {
      record.paidAt = new Date();
    }
    await record.save();
    return record;
  }
}

export default new SalaryService();
