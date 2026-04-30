// services/leaveService.js
import LeaveRequest from '../models/LeaveRequest.js';
 import Employee from '../models/employe.js';

class LeaveService {
    
    // Create new leave request
    async createLeaveRequest(employeeId, leaveData) {
        try {
            // Check if employee exists
            const employee = await Employee.findById(employeeId);
            if (!employee) {
                throw new Error("Employee not found");
            }

            // Check for overlapping leave requests
            const overlappingLeave = await LeaveRequest.findOne({
                employee: employeeId,
                status: { $in: ['pending', 'approved'] },
                $or: [
                    {
                        start_date: { $lte: leaveData.end_date },
                        end_date: { $gte: leaveData.start_date }
                    }
                ]
            });

            if (overlappingLeave) {
                throw new Error("You already have a pending or approved leave for these dates");
            }

            // Create leave request
            const leaveRequest = await LeaveRequest.create({
                ...leaveData,
                employee: employeeId
            });

            await leaveRequest.populate('employee', 'firstName lastName email department position');
            
            return {
                success: true,
                message: "Leave request submitted successfully",
                data: leaveRequest
            };
        } catch (error) {
            throw new Error(`Failed to create leave request: ${error.message}`);
        }
    }

    // Get leave request by ID
    async getLeaveRequestById(leaveId) {
        try {
            const leaveRequest = await LeaveRequest.findById(leaveId)
                .populate('employee', 'firstName lastName email department position employeeId')
                .populate('approved_by', 'firstName lastName email position');
            
            if (!leaveRequest) {
                throw new Error("Leave request not found");
            }
            
            return leaveRequest;
        } catch (error) {
            throw new Error(`Failed to get leave request: ${error.message}`);
        }
    }

    // Get all leave requests for an employee
    async getLeaveRequestsByEmployee(employeeId, filters = {}, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            
            const query = { employee: employeeId };
            
            // Apply filters
            if (filters.status) {
                query.status = filters.status;
            }
            
            if (filters.leave_type) {
                query.leave_type = filters.leave_type;
            }
            
            if (filters.start_date || filters.end_date) {
                query.start_date = {};
                if (filters.start_date) {
                    query.start_date.$gte = new Date(filters.start_date);
                }
                if (filters.end_date) {
                    query.start_date.$lte = new Date(filters.end_date);
                }
            }

            const [leaveRequests, total] = await Promise.all([
                LeaveRequest.find(query)
                    .populate('employee', 'firstName lastName email department position')
                    .populate('approved_by', 'firstName lastName')
                    .sort({ start_date: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                LeaveRequest.countDocuments(query)
            ]);

            return {
                leaveRequests,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get leave requests: ${error.message}`);
        }
    }

    // Get all leave requests (for managers/admin)
    async getAllLeaveRequests(filters = {}, page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;
            
            let query = {};
            
            // Apply filters
            if (filters.status) {
                query.status = filters.status;
            }
            
            if (filters.leave_type) {
                query.leave_type = filters.leave_type;
            }
            
            if (filters.employee_id) {
                query.employee = filters.employee_id;
            }
            
            if (filters.department) {
                // First get employees in this department
                const employees = await Employee.find({ department: filters.department }).select('_id');
                const employeeIds = employees.map(emp => emp._id);
                query.employee = { $in: employeeIds };
            }
            
            if (filters.start_date || filters.end_date) {
                query.start_date = {};
                if (filters.start_date) {
                    query.start_date.$gte = new Date(filters.start_date);
                }
                if (filters.end_date) {
                    query.start_date.$lte = new Date(filters.end_date);
                }
            }

            const [leaveRequests, total] = await Promise.all([
                LeaveRequest.find(query)
                    .populate('employee', 'firstName lastName email department position employeeId')
                    .populate('approved_by', 'firstName lastName')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                LeaveRequest.countDocuments(query)
            ]);

            return {
                leaveRequests,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get all leave requests: ${error.message}`);
        }
    }

    // Update leave request (employee can update pending requests)
    async updateLeaveRequest(leaveId, employeeId, updateData) {
        try {
            const leaveRequest = await LeaveRequest.findById(leaveId);
            
            if (!leaveRequest) {
                throw new Error("Leave request not found");
            }
            
            // Check if employee owns this leave request
            if (leaveRequest.employee.toString() !== employeeId) {
                throw new Error("You are not authorized to update this leave request");
            }
            
            // Only allow updates if status is pending
            if (leaveRequest.status !== 'pending') {
                throw new Error("Only pending leave requests can be updated");
            }
            
            // If dates are being updated, check for overlaps
            if (updateData.start_date || updateData.end_date) {
                const startDate = updateData.start_date || leaveRequest.start_date;
                const endDate = updateData.end_date || leaveRequest.end_date;
                
                const overlappingLeave = await LeaveRequest.findOne({
                    _id: { $ne: leaveId },
                    employee: employeeId,
                    status: { $in: ['pending', 'approved'] },
                    $or: [
                        {
                            start_date: { $lte: endDate },
                            end_date: { $gte: startDate }
                        }
                    ]
                });
                
                if (overlappingLeave) {
                    throw new Error("You already have a pending or approved leave for these dates");
                }
            }
            
            // Update the leave request
            Object.keys(updateData).forEach(key => {
                leaveRequest[key] = updateData[key];
            });
            
            // Recalculate number_of_days if dates changed
            if (updateData.start_date || updateData.end_date) {
                const startDate = updateData.start_date || leaveRequest.start_date;
                const endDate = updateData.end_date || leaveRequest.end_date;
                const timeDiff = endDate.getTime() - startDate.getTime();
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                leaveRequest.number_of_days = dayDiff;
            }
            
            await leaveRequest.save();
            await leaveRequest.populate('employee', 'firstName lastName email department position');
            
            return {
                success: true,
                message: "Leave request updated successfully",
                data: leaveRequest
            };
        } catch (error) {
            throw new Error(`Failed to update leave request: ${error.message}`);
        }
    }

    // Approve leave request
    async approveLeaveRequest(leaveId, approvedById) {
        try {
            const leaveRequest = await LeaveRequest.findById(leaveId);
            
            if (!leaveRequest) {
                throw new Error("Leave request not found");
            }
            
            if (leaveRequest.status !== 'pending') {
                throw new Error(`Leave request is already ${leaveRequest.status}`);
            }
            
            leaveRequest.status = 'approved';
            leaveRequest.approved_by = approvedById;
            leaveRequest.approved_at = new Date();
            
            await leaveRequest.save();
            
            await leaveRequest.populate('employee', 'firstName lastName email department position');
            await leaveRequest.populate('approved_by', 'firstName lastName email position');
            
            return {
                success: true,
                message: "Leave request approved successfully",
                data: leaveRequest
            };
        } catch (error) {
            throw new Error(`Failed to approve leave request: ${error.message}`);
        }
    }

    // Reject leave request
    // async rejectLeaveRequest(leaveId, approvedById, rejectionReason) {
    //     try {
    //         const leaveRequest = await LeaveRequest.findById(leaveId);
            
    //         if (!leaveRequest) {
    //             throw new Error("Leave request not found");
    //         }
            
    //         if (leaveRequest.status !== 'pending') {
    //             throw new Error(`Leave request is already ${leaveRequest.status}`);
    //         }
            
    //         leaveRequest.status = 'rejected';
    //         leaveRequest.approved_by = approvedById;
    //         leaveRequest.approved_at = new Date();
    //         leaveRequest.rejection_reason = rejectionReason;
            
    //         await leaveRequest.save();
            
    //         await leaveRequest.populate('employee', 'firstName lastName email department position');
    //         await leaveRequest.populate('approved_by', 'firstName lastName email position');
            
    //         return {
    //             success: true,
    //             message: "Leave request rejected successfully",
    //             data: leaveRequest
    //         };
    //     } catch (error) {
    //         throw new Error(`Failed to reject leave request: ${error.message}`);
    //     }
    // }








    async rejectLeaveRequest(leaveId, approvedById, rejectionReason) {
    try {
        const leaveRequest = await LeaveRequest.findById(leaveId);
        
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        
        if (leaveRequest.status !== 'pending') {
            throw new Error(`Leave request is already ${leaveRequest.status}`);
        }
        
        leaveRequest.status = 'rejected';
        leaveRequest.approved_by = approvedById;
        leaveRequest.approved_at = new Date();
        leaveRequest.rejection_reason = rejectionReason;
        
        await leaveRequest.save();
        
        await leaveRequest.populate('employee', 'firstName lastName email department position');
        await leaveRequest.populate('approved_by', 'firstName lastName email position');
        
        return {
            success: true,
            message: "Leave request rejected successfully",
            data: leaveRequest
        };
    } catch (error) {
       
        throw error;
    }
}

    // Cancel leave request (employee can cancel their own request)
    async cancelLeaveRequest(leaveId, employeeId) {
        try {
            const leaveRequest = await LeaveRequest.findById(leaveId);
            
            if (!leaveRequest) {
                throw new Error("Leave request not found");
            }
            
            // Check if employee owns this leave request
            if (leaveRequest.employee.toString() !== employeeId) {
                throw new Error("You are not authorized to cancel this leave request");
            }
            
            // Only allow cancellation of pending or approved requests
            if (!['pending', 'approved'].includes(leaveRequest.status)) {
                throw new Error(`Cannot cancel a ${leaveRequest.status} leave request`);
            }
            
            // If leave has already started, check if it's in the past
            if (leaveRequest.start_date <= new Date()) {
                throw new Error("Cannot cancel a leave that has already started");
            }
            
            leaveRequest.status = 'cancelled';
            await leaveRequest.save();
            
            await leaveRequest.populate('employee', 'firstName lastName email department position');
            
            return {
                success: true,
                message: "Leave request cancelled successfully",
                data: leaveRequest
            };
        } catch (error) {
            throw new Error(`Failed to cancel leave request: ${error.message}`);
        }
    }

    // Get leave statistics for an employee
    async getLeaveStatistics(employeeId, year = null) {
        try {
            const targetYear = year || new Date().getFullYear();
            const startDate = new Date(targetYear, 0, 1);
            const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
            
            const leaveRequests = await LeaveRequest.find({
                employee: employeeId,
                start_date: { $gte: startDate, $lte: endDate }
            });
            
            // Calculate statistics
            const stats = {
                total_requests: leaveRequests.length,
                approved: 0,
                pending: 0,
                rejected: 0,
                cancelled: 0,
                total_days_taken: 0,
                by_type: {},
                by_month: Array(12).fill(0)
            };
            
            leaveRequests.forEach(request => {
                stats[request.status]++;
                
                if (request.status === 'approved') {
                    stats.total_days_taken += request.number_of_days;
                }
                
                // Count by leave type
                if (!stats.by_type[request.leave_type]) {
                    stats.by_type[request.leave_type] = {
                        count: 0,
                        days: 0
                    };
                }
                stats.by_type[request.leave_type].count++;
                if (request.status === 'approved') {
                    stats.by_type[request.leave_type].days += request.number_of_days;
                }
                
                // Count by month
                const monthIndex = request.start_date.getMonth();
                stats.by_month[monthIndex] += request.number_of_days;
            });
            
            // Calculate approval rate
            stats.approval_rate = stats.total_requests > 0 
                ? parseFloat(((stats.approved / stats.total_requests) * 100).toFixed(2))
                : 0;
            
            return {
                year: targetYear,
                statistics: stats
            };
        } catch (error) {
            throw new Error(`Failed to get leave statistics: ${error.message}`);
        }
    }

    // Get upcoming leaves for team/department
    async getUpcomingLeaves(department = null, limit = 10) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let query = {
                status: 'approved',
                start_date: { $gte: today }
            };
            
            if (department) {
                // Get employees in the department
                const employees = await Employee.find({ department }).select('_id');
                const employeeIds = employees.map(emp => emp._id);
                query.employee = { $in: employeeIds };
            }
            
            const upcomingLeaves = await LeaveRequest.find(query)
                .populate('employee', 'firstName lastName email department position')
                .sort({ start_date: 1 })
                .limit(limit)
                .lean();
            
            return upcomingLeaves;
        } catch (error) {
            throw new Error(`Failed to get upcoming leaves: ${error.message}`);
        }
    }

    // Check leave balance (you'll need to integrate with your leave policy)
    async getLeaveBalance(employeeId) {
        try {
            const employee = await Employee.findById(employeeId);
            if (!employee) {
                throw new Error("Employee not found");
            }
            
            const currentYear = new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
            
            // Get approved leaves for current year
            const approvedLeaves = await LeaveRequest.find({
                employee: employeeId,
                status: 'approved',
                start_date: { $gte: startDate, $lte: endDate }
            });
            
            // Calculate total leave days taken
            const totalTaken = approvedLeaves.reduce((sum, leave) => sum + leave.number_of_days, 0);
            
            // Get employee's leave entitlement (you should have this in Employee model)
            const leaveEntitlement = employee.leave_entitlement || {
                vacation: 15,
                sick: 10,
                casual: 7
            };
            
            // Calculate balance
            const balance = {};
            Object.keys(leaveEntitlement).forEach(type => {
                const taken = approvedLeaves
                    .filter(leave => leave.leave_type === type)
                    .reduce((sum, leave) => sum + leave.number_of_days, 0);
                
                balance[type] = {
                    entitlement: leaveEntitlement[type],
                    taken: taken,
                    balance: leaveEntitlement[type] - taken
                };
            });
            
            return {
                employee: {
                    id: employee._id,
                    name: `${employee.firstName} ${employee.lastName}`,
                    department: employee.department
                },
                year: currentYear,
                total_taken: totalTaken,
                balance: balance
            };
        } catch (error) {
            throw new Error(`Failed to get leave balance: ${error.message}`);
        }
    }
}

export default new LeaveService();