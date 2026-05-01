import salaryService from '../services/salaryService.js';

class SalaryController {
  async calculateSalary(req, res) {
    try {
      const { employeeId, month, year } = req.body;
      const record = await salaryService.calculateMonthlySalary(employeeId, parseInt(month), parseInt(year));
      res.status(200).json({ success: true, data: record });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async processAllSalaries(req, res) {
    try {
      const { month, year } = req.body;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const targetMonth = parseInt(month) || currentMonth;
      const targetYear = parseInt(year) || currentYear;

      const records = await salaryService.processAllSalaries(targetMonth, targetYear);
      res.status(200).json({ success: true, message: `Processed ${records.length} salaries.`, data: records });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRecords(req, res) {
    try {
      const { employeeId, month, year, status } = req.query;
      const filters = {};
      if (employeeId) filters.employee = employeeId;
      if (month) filters.month = parseInt(month);
      if (year) filters.year = parseInt(year);
      if (status) filters.status = status;

      const records = await salaryService.getSalaryRecords(filters);
      res.status(200).json({ success: true, data: records });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedRecord = await salaryService.updateSalaryStatus(id, status);
      res.status(200).json({ success: true, message: 'Status updated successfully', data: updatedRecord });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new SalaryController();
