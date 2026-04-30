// controllers/leaveController.js
import leaveService from '../services/leaveService.js';
import { validationResult } from 'express-validator';

class LeaveController {
    
    // Create leave request
    async createLeaveRequest(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            const employeeId = req.user.id;
            const leaveData = req.body;
            
            const result = await leaveService.createLeaveRequest(employeeId, leaveData);
            
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Get leave request by ID
    async getLeaveRequest(req, res) {
        try {
            const { leaveId } = req.params;
            const leaveRequest = await leaveService.getLeaveRequestById(leaveId);
            
            res.status(200).json({
                success: true,
                data: leaveRequest
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }


    
    
    // Get employee's leave requests
    async getEmployeeLeaveRequests(req, res) {
        try {
            const employeeId = req.user.id;
            const { 
                status, 
                leave_type, 
                start_date, 
                end_date, 
                page = 1, 
                limit = 20 
            } = req.query;
            
            const filters = {
                status,
                leave_type,
                start_date,
                end_date
            };
            
            const result = await leaveService.getLeaveRequestsByEmployee(
                employeeId, 
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
    
    // Get all leave requests (for admin/manager)
    async getAllLeaveRequests(req, res) {
        try {
            const { 
                status, 
                leave_type, 
                employee_id, 
                department,
                start_date, 
                end_date, 
                page = 1, 
                limit = 50 
            } = req.query;
            
            const filters = {
                status,
                leave_type,
                employee_id,
                department,
                start_date,
                end_date
            };
            
            const result = await leaveService.getAllLeaveRequests(
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
    
    // Update leave request
    async updateLeaveRequest(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            const { leaveId } = req.params;
            const employeeId = req.user.id;
            const updateData = req.body;
            
            const result = await leaveService.updateLeaveRequest(leaveId, employeeId, updateData);
            
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Approve leave request
    async approveLeaveRequest(req, res) {
        try {
            const { leaveId } = req.params;
            const approvedById = req.user.id;
            
            const result = await leaveService.approveLeaveRequest(leaveId, approvedById);
            
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Reject leave request
    async rejectLeaveRequest(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            const { leaveId } = req.params;
            const approvedById = req.user.id;
            const { rejection_reason } = req.body;
            
            const result = await leaveService.rejectLeaveRequest(leaveId, approvedById, rejection_reason);
            
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Cancel leave request
    async cancelLeaveRequest(req, res) {
        try {
            const { leaveId } = req.params;
            const employeeId = req.user.id;
            
            const result = await leaveService.cancelLeaveRequest(leaveId, employeeId);
            
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Get leave statistics
    async getLeaveStatistics(req, res) {
        try {
            const employeeId = req.user.id;
            const { year } = req.query;
            
            const result = await leaveService.getLeaveStatistics(employeeId, year ? parseInt(year) : null);
            
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
    
    // Get upcoming leaves
    async getUpcomingLeaves(req, res) {
        try {
            const { department, limit = 10 } = req.query;
            
            const leaves = await leaveService.getUpcomingLeaves(department, parseInt(limit));
            
            res.status(200).json({
                success: true,
                data: leaves
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Get leave balance
    async getLeaveBalance(req, res) {
        try {
            const employeeId = req.user.id;
            
            const balance = await leaveService.getLeaveBalance(employeeId);
            
            res.status(200).json({
                success: true,
                data: balance
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Bulk approve/reject leaves (admin)
//    async bulkProcessLeaves(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
        
//         const { leave_ids, action, rejection_reason } = req.body;
//         const approvedById = req.user.id;
        
//         if (!Array.isArray(leave_ids) || leave_ids.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide leave IDs"
//             });
//         }
        
//         const results = {
//             approved: [],
//             rejected: [],
//             errors: []
//         };
        
//         for (const leaveId of leave_ids) {
//             try {
//                 if (action === 'approve') {
//                     const result = await leaveService.approveLeaveRequest(leaveId, approvedById);
//                     results.approved.push({
//                         leave_id: leaveId,
//                         result: result
//                     });
//                 } else if (action === 'reject') {
//                     const result = await leaveService.rejectLeaveRequest(leaveId, approvedById, rejection_reason);
//                     results.rejected.push({
//                         leave_id: leaveId,
//                         result: result
//                     });
//                 }
//             } catch (error) {
//                 results.errors.push({
//                     leave_id: leaveId,
//                     error: error.message
//                 });
//             }
//         }
        
      
//         if (results.errors.length === 0) {
           
//             return res.status(200).json({
//                 success: true,
//                 message: `Bulk ${action} completed successfully`,
//                 data: results
//             });
//         } else if (results.approved.length === 0 && results.rejected.length === 0) {
//             // All failed
//             return res.status(400).json({
//                 success: false,
//                 message: `Bulk ${action} failed for all requests`,
//                 data: results
//             });
//         } else {
//             // Partial success
//             return res.status(207).json({  
//                 success: false,
//                 message: `Bulk ${action} completed with ${results.errors.length} error(s)`,
//                 data: results
//             });
//         }
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// }





async bulkProcessLeaves(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { leave_ids, action, rejection_reason } = req.body;
        const approvedById = req.user.id;
        
        if (!Array.isArray(leave_ids) || leave_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide leave IDs"
            });
        }
        
        const results = {
            approved: [],
            rejected: [],
            errors: []
        };
        
        for (const leaveId of leave_ids) {
            try {
                if (action === 'approve') {
                    const result = await leaveService.approveLeaveRequest(leaveId, approvedById);
                    results.approved.push({
                        leave_id: leaveId,
                        result: result
                    });
                } else if (action === 'reject') {
                    const result = await leaveService.rejectLeaveRequest(leaveId, approvedById, rejection_reason);
                    results.rejected.push({
                        leave_id: leaveId,
                        result: result
                    });
                }
            } catch (error) {
                // Extract the actual error message without the "Failed to..." wrapper
                let errorMessage = error.message;
                if (errorMessage.startsWith('Failed to reject leave request:')) {
                    errorMessage = errorMessage.replace('Failed to reject leave request:', '').trim();
                }
                if (errorMessage.startsWith('Failed to approve leave request:')) {
                    errorMessage = errorMessage.replace('Failed to approve leave request:', '').trim();
                }
                
                results.errors.push({
                    leave_id: leaveId,
                    error: errorMessage
                });
            }
        }
        
        // Determine response based on results
        if (results.errors.length === 0) {
            // All successful
            return res.status(200).json({
                success: true,
                message: `Bulk ${action} completed successfully`,
                data: results
            });
        } else if (results.approved.length === 0 && results.rejected.length === 0) {
            // All failed
            const errorMessages = results.errors.map(e => e.error).join('; ');
            return res.status(400).json({
                success: false,
                message: errorMessages, // Direct error message without wrapper
                data: results
            });
        } else {
            // Partial success
            const failedIds = results.errors.map(e => e.leave_id).join(', ');
            const errorMessages = results.errors.map(e => e.error).join('; ');
            return res.status(207).json({
                success: false,
                message: `Some requests failed: ${errorMessages}`,
                data: {
                    ...results,
                    summary: {
                        total: leave_ids.length,
                        succeeded: results.approved.length + results.rejected.length,
                        failed: results.errors.length,
                        failed_ids: results.errors.map(e => e.leave_id)
                    }
                }
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
}

export default new LeaveController();