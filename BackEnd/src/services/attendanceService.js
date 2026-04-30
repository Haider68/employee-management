import Attendance from '../models/attendence.js';
import Employee from '../models/employe.js';

class AttendanceService {
  
async checkIn(employeeId) {
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

       console.log("employee",employee);

    const now = new Date();
    const todayDate = new Date()
      .toLocaleDateString("en-CA"); 

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: todayDate
    });

     console.log("attendence",attendance);

    if (attendance) {
      if (attendance.checkIn) {
        return {
          success: false,
          message: "Already checked in",
          data: attendance
        };
      }

      attendance.checkIn = now;
      attendance.status = "present";
      await attendance.save();


         console.log("attendance1111",attendance);

      return {
        success: true,
        message: "Check-in recorded successfully",
        data: attendance
      };
    }

    // 🆕 Create new attendance
    attendance = await Attendance.create({
      employee: employeeId,
      date: todayDate,
      checkIn: now,
      status: "present"
    });

    return {
      success: true,
      message: "Check-in recorded successfully",
      data: attendance
    };
  } catch (error) {
    throw new Error(`Failed to check-in: ${error.message}`);
  }
}


async checkOut(employeeId) {
  try {
     const todayDate = new Date()
      .toLocaleDateString("en-CA"); 
   
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: todayDate
    });

    if (!attendance) {
      throw new Error('No check-in found for today');
    }

    if (attendance.checkOut) {
      throw new Error('Already checked out for today');
    }

    // Set check-out to current time
    attendance.checkOut = new Date();
    await attendance.save();
    
    return attendance;
  } catch (error) {
    throw new Error(`Failed to check-out: ${error.message}`);
  }
}

  // Get today's attendance status for an employee
async getTodayAttendance(employeeId) {
  try {
    const today = new Date().toLocaleDateString("en-CA"); 
     
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('employee', 'firstName lastName email department');
    
    console.log('Found attendance:', attendance);
    
    if (!attendance) {
      console.log('No attendance record found for today');
      return {
        message: 'No attendance record for today',
        hasCheckedIn: false,
        hasCheckedOut: false
      };
    }
    
    console.log('Attendance checkIn:', attendance.checkIn);
    console.log('Attendance checkOut:', attendance.checkOut);
    console.log('Attendance status:', attendance.status);
    
    return {
      attendance,
      hasCheckedIn: !!attendance.checkIn,
      hasCheckedOut: !!attendance.checkOut,
      workingHours: attendance.workingHours || 0
    };
  } catch (error) {
    console.error('Error in getTodayAttendance:', error);
    throw new Error(`Failed to get today's attendance: ${error.message}`);
  }
}

  // Get attendance for a specific date range
  async getAttendanceByDateRange(employeeId, startDate, endDate, page = 1, limit = 30) {
    try {
      const skip = (page - 1) * limit;
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const query = {
        employee: employeeId,
        date: {
          $gte: start,
          $lte: end
        }
      };

      const [attendance, total] = await Promise.all([
        Attendance.find(query)
          .populate('employee', 'firstName lastName email department')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Attendance.countDocuments(query)
      ]);

      return {
        attendance,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get attendance records: ${error.message}`);
    }
  }

  // Get all attendance records with filters (for admin)
async getAllAttendance(filters = {}, page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    if (filters.employeeId) {
      query.employee = filters.employeeId;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        const start = new Date(filters.startDate).toLocaleDateString("en-CA");
        query.date.$gte = start;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).toLocaleDateString("en-CA");
        query.date.$lte = end;
      }
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employee') 
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query)
    ]);

    return {
      attendance,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to get all attendance: ${error.message}`);
  }
}

  // Update attendance manually (admin function)
  async updateAttendance(attendanceId, updateData) {
    try {
      const attendance = await Attendance.findById(attendanceId);
      
      if (!attendance) {
        throw new Error('Attendance record not found');
      }

      // Recalculate working hours if checkIn or checkOut is updated
      if (updateData.checkIn || updateData.checkOut) {
        const checkIn = updateData.checkIn ? new Date(updateData.checkIn) : attendance.checkIn;
        const checkOut = updateData.checkOut ? new Date(updateData.checkOut) : attendance.checkOut;
        
        if (checkIn && checkOut) {
          const workingHours = (checkOut - checkIn) / (1000 * 60 * 60);
          updateData.workingHours = parseFloat(workingHours.toFixed(2));
          
          // Update status based on working hours
          if (workingHours > 0) {
            updateData.status = 'present';
          }
        }
      }

      Object.keys(updateData).forEach(key => {
        attendance[key] = updateData[key];
      });

      return await attendance.save();
    } catch (error) {
      throw new Error(`Failed to update attendance: ${error.message}`);
    }
  }

  // Mark absent for employees who didn't check-in
  async markAbsentForDate(date) {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get all active employees
      const activeEmployees = await Employee.find({ status: 'active' }).select('_id');
      
      const employeeIds = activeEmployees.map(emp => emp._id);

      // Find employees who have attendance for the date
      const presentEmployees = await Attendance.find({
        date: {
          $gte: targetDate,
          $lt: nextDay
        },
        status: 'present'
      }).distinct('employee');

      // Find employees who are absent
      const absentEmployeeIds = employeeIds.filter(
        empId => !presentEmployees.some(presentId => presentId.equals(empId))
      );

      // Create absent records
      const absentRecords = absentEmployeeIds.map(employeeId => ({
        employee: employeeId,
        date: targetDate,
        status: 'absent',
        checkIn: null,
        checkOut: null
      }));

      // Insert absent records (use bulk write for efficiency)
      if (absentRecords.length > 0) {
        await Attendance.insertMany(absentRecords, { ordered: false });
      }

      return {
        date: targetDate,
        totalEmployees: employeeIds.length,
        presentCount: presentEmployees.length,
        absentCount: absentEmployeeIds.length,
        absentEmployees: absentEmployeeIds
      };
    } catch (error) {
      throw new Error(`Failed to mark absent employees: ${error.message}`);
    }
  }



  // Get attendance statistics
async getAttendanceStats(employeeId, month, year) {
  try {
    const startDate = new Date(year, month - 1, 1).toLocaleString("en-CA");
    const endDate = new Date(year, month, 0).toLocaleString("en-CA");
   

    const query = {
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    const attendanceRecords = await Attendance.find(query);
   

    const totalDays = new Date(year, month, 0).getDate();
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
    const notMarkedDays = totalDays - presentDays - absentDays;

    // Calculate total working time in milliseconds
    let totalMs = 0;
    
    attendanceRecords.forEach(record => {
      if (record.status === 'present' && record.checkIn && record.checkOut) {
        try {
          const checkInTime = new Date(record.checkIn);
          const checkOutTime = new Date(record.checkOut);
          
          // Calculate difference in milliseconds
          const diffMs = checkOutTime.getTime() - checkInTime.getTime();
          
          if (diffMs > 0) {
            totalMs += diffMs;
            
            // Log each record's duration for debugging
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            console.log(`Record ${record._id}: ${hours}h ${minutes}m ${seconds}s (${diffMs}ms)`);
          }
          
        } catch (error) {
          console.error(`Error calculating time for record ${record._id}:`, error);
        }
      }
    });

    // Convert total milliseconds to hours, minutes, seconds
    const totalHoursDecimal = totalMs / (1000 * 60 * 60);
    const totalMinutes = Math.floor(totalMs / (1000 * 60));
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const remainingSeconds = Math.floor((totalMs % (1000 * 60)) / 1000);
    
    // Format as strings
    const totalWorkingTimeFormatted = `${totalHours}h ${remainingMinutes}m`;
    const totalWorkingTimeDetailed = `${totalHours}h ${remainingMinutes}m ${remainingSeconds}s`;

    // Calculate average working hours per day
    const averageHoursPerDay = presentDays > 0 ? totalHoursDecimal / presentDays : 0;
    const avgHours = Math.floor(averageHoursPerDay);
    const avgMinutes = Math.floor((averageHoursPerDay - avgHours) * 60);
    const avgSeconds = Math.floor(((averageHoursPerDay - avgHours) * 60 - avgMinutes) * 60);
    const averageTimeFormatted = `${avgHours}h ${avgMinutes}m`;
 

    return {
      month: `${month}/${year}`,
      totalDays,
      presentDays,
      absentDays,
      notMarkedDays,
      totalWorkingHours: parseFloat(totalHoursDecimal.toFixed(2)),
      totalWorkingMinutes: totalMinutes,
      totalWorkingTimeFormatted: totalWorkingTimeFormatted,
      totalWorkingTimeDetailed: totalWorkingTimeDetailed,
      averageHoursPerDay: parseFloat(averageHoursPerDay.toFixed(2)),
      averageTimeFormatted: averageTimeFormatted,
      attendancePercentage: parseFloat(((presentDays / totalDays) * 100).toFixed(2))
    };
  } catch (error) {
    throw new Error(`Failed to get attendance statistics: ${error.message}`);
  }
}
}

export default new AttendanceService();