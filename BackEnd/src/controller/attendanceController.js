import attendanceService from '../services/attendanceService.js';
import { validationResult } from 'express-validator';

class AttendanceController {
  // Check-in endpoint
// controllers/attendanceController.js

async checkIn(req, res) {
  try {
    // No validation needed since no body parameters
    const employeeId = req.user.id;
    const attendance = await attendanceService.checkIn(employeeId);
       console.log("123",attendance);
    res.status(200).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: {
        date: attendance.date,
        checkIn: attendance.checkIn,
        status: attendance.status
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async checkOut(req, res) {
  try {
    const employeeId = req.user.id;
          
    const attendance = await attendanceService.checkOut(employeeId);
    
    res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully',
      data: {
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

  // Get today's attendance
  async getTodayAttendance(req, res) {
    try {
      const { employeeId } = req.params;
       
      console.log("employeeId", employeeId);
      const result = await attendanceService.getTodayAttendance(employeeId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get attendance by date range
  async getAttendanceByDateRange(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { employeeId } = req.params;
      const { startDate, endDate, page = 1, limit = 30 } = req.query;

      const result = await attendanceService.getAttendanceByDateRange(
        employeeId,
        startDate,
        endDate,
        parseInt(page),
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all attendance (admin)
  async getAllAttendance(req, res) {
    try {
      const {
        employeeId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const filters = {
        employeeId,
        status,
        startDate,
        endDate
      };

      const result = await attendanceService.getAllAttendance(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update attendance (admin)
  async updateAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { attendanceId } = req.params;
      const updateData = req.body;

      const attendance = await attendanceService.updateAttendance(attendanceId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark absent for date (admin)
  async markAbsentForDate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
     
      const targetDate =  new Date().toISOString().split('T')[0];

      const result = await attendanceService.markAbsentForDate(targetDate);
      
      res.status(200).json({
        success: true,
        message: 'Absent employees marked successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get attendance statistics
  async getAttendanceStats(req, res) {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;
      
      const currentDate = new Date();
      const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
      const targetYear = parseInt(year) || currentDate.getFullYear();

      const stats = await attendanceService.getAttendanceStats(employeeId, targetMonth, targetYear);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bulk check-in/check-out (for admin)
  async bulkAttendanceUpdate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { attendanceData } = req.body;
      
      // attendanceData should be an array of { employeeId, date, checkIn, checkOut, status }
      const results = [];
      const errorsList = [];

      for (const data of attendanceData) {
        try {
          // Check if attendance exists for the date
          const targetDate = new Date(data.date);
          targetDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);

          let attendance = await Attendance.findOne({
            employee: data.employeeId,
            date: {
              $gte: targetDate,
              $lt: nextDay
            }
          });

          if (attendance) {
            // Update existing
            if (data.checkIn) attendance.checkIn = new Date(data.checkIn);
            if (data.checkOut) attendance.checkOut = new Date(data.checkOut);
            if (data.status) attendance.status = data.status;
          } else {
            // Create new
            attendance = new Attendance({
              employee: data.employeeId,
              date: targetDate,
              checkIn: data.checkIn ? new Date(data.checkIn) : null,
              checkOut: data.checkOut ? new Date(data.checkOut) : null,
              status: data.status || 'not-marked'
            });
          }

          // Calculate working hours if both checkIn and checkOut exist
          if (attendance.checkIn && attendance.checkOut) {
            const workingHours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
            attendance.workingHours = parseFloat(workingHours.toFixed(2));
          }

          const savedAttendance = await attendance.save();
          results.push(savedAttendance);
        } catch (error) {
          errorsList.push({
            employeeId: data.employeeId,
            date: data.date,
            error: error.message
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Bulk attendance update completed',
        data: {
          updated: results.length,
          errors: errorsList.length,
          details: {
            successful: results.map(r => r._id),
            errors: errorsList
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AttendanceController();