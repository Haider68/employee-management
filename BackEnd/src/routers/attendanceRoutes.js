import express from 'express';
 import attendanceController from '../controller/attendanceController.js';
import { body, param, query } from 'express-validator';
import AuthMiddleware from '../middleware/auth.js';
 
const router = express.Router();

// Apply auth middleware to all routes
router.use(AuthMiddleware.protect);

// Check-in
router.post(
  '/check-in',
  attendanceController.checkIn
);

// Check-out
router.post(
  '/check-out',
  attendanceController.checkOut
);

// Get today's attendance
router.get(
  '/today/:employeeId',
  attendanceController.getTodayAttendance
);

// Get attendance by date range
router.get(
  '/employee/:employeeId/range',
  attendanceController.getAttendanceByDateRange
);

// Get attendance statistics
router.get(
  '/stats/:employeeId',
  attendanceController.getAttendanceStats
);

 


// Get all attendance with filters
router.get(
  '/all',
  attendanceController.getAllAttendance
);

// Update attendance (admin)
router.put(
  '/:attendanceId',
  attendanceController.updateAttendance
);

// Mark absent for date
router.post(
  '/mark-absent',
  attendanceController.markAbsentForDate
);

// Bulk attendance update
router.post(
  '/bulk-update',
  [
    body('attendanceData').isArray().withMessage('attendanceData must be an array'),
    body('attendanceData.*.employeeId').isMongoId().withMessage('Valid employee ID is required'),
    body('attendanceData.*.date').isISO8601().withMessage('Valid date format required'),
    body('attendanceData.*.checkIn').optional().isISO8601(),
    body('attendanceData.*.checkOut').optional().isISO8601(),
    body('attendanceData.*.status').optional().isIn(['present', 'absent', 'not-marked', 'half-day', 'leave'])
  ],
  attendanceController.bulkAttendanceUpdate
);

export default router;