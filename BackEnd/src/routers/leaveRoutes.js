 
import express from 'express';
 import leaveController from '../controller/leaveController.js';
import { body, param, query } from 'express-validator';
 import AuthMiddleware from '../middleware/auth.js';
const router = express.Router();

router.use(AuthMiddleware.protect);
// Employee routes
router.post(
    '/create-leave',
    [
        body('leave_type').isIn(['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'casual', 'compensatory']),
        body('start_date').isISO8601().toDate(),
        body('end_date').isISO8601().toDate(),
        body('reason').notEmpty().trim().escape(),
        body('number_of_days').optional().isFloat({ min: 0.5 })
    ],
    leaveController.createLeaveRequest
);


router.get(
    '/my-leaves',
    [
        query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
        query('leave_type').optional().isIn(['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'casual', 'compensatory']),
        query('start_date').optional().isISO8601(),
        query('end_date').optional().isISO8601(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    leaveController.getEmployeeLeaveRequests
);

router.get(
    '/balance',
    leaveController.getLeaveBalance
);

router.get(
    '/statistics',
    [
        query('year').optional().isInt({ min: 2000, max: 2100 })
    ],
    leaveController.getLeaveStatistics
);

router.put(
    '/:leaveId',
    [
        param('leaveId').isMongoId(),
        body('leave_type').optional().isIn(['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'casual', 'compensatory']),
        body('start_date').optional().isISO8601().toDate(),
        body('end_date').optional().isISO8601().toDate(),
        body('reason').optional().notEmpty().trim().escape()
    ],
    leaveController.updateLeaveRequest
);

router.put(
    '/:leaveId/cancel',
    [
        param('leaveId').isMongoId()
    ],
    leaveController.cancelLeaveRequest
);

// Manager/Admin routes
router.get(
    '/all',
    [
        query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
        query('leave_type').optional().isIn(['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'casual', 'compensatory']),
        query('employee_id').optional().isMongoId(),
        query('department').optional().trim().escape(),
        query('start_date').optional().isISO8601(),
        query('end_date').optional().isISO8601(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 200 })
    ],
    leaveController.getAllLeaveRequests
);

router.get(
    '/upcoming',
    [
        query('department').optional().trim().escape(),
        query('limit').optional().isInt({ min: 1, max: 50 })
    ],
    leaveController.getUpcomingLeaves
);

router.get(
    '/:leaveId',
    [
        param('leaveId').isMongoId()
    ],
    leaveController.getLeaveRequest
);

router.put(
    '/:leaveId/approve',
    
    [
        param('leaveId').isMongoId()
    ],
    leaveController.approveLeaveRequest
);

router.put(
    '/:leaveId/reject',
    [
        param('leaveId').isMongoId(),
        body('rejection_reason').notEmpty().trim().escape()
    ],
    leaveController.rejectLeaveRequest
);

router.post(
    '/bulk-process',
    [
        body('leave_ids').isArray().notEmpty(),
        body('leave_ids.*').isMongoId(),
        body('action').isIn(['approve', 'reject']),
        body('rejection_reason').if(body('action').equals('reject')).notEmpty().trim().escape()
    ],
    leaveController.bulkProcessLeaves
);

export default router;