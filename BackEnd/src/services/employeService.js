import Employee from '../models/employe.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

class EmployeeService {
    // Create new employee with avatar
    async createEmployee(employeeData) {
        try {

              const checkEmployeExistsOrNot = await Employee.findOne({ email: employeeData.email });
              if(checkEmployeExistsOrNot){
                throw new Error('Email already exists');
              }
            const employee = new Employee(employeeData);
            return await employee.save();
        } catch (error) {
           
            if (employeeData.avatar && employeeData.avatar.public_id) {
                await deleteFromCloudinary(employeeData.avatar.public_id);
            }
            throw new Error(`Error creating employee: ${error.message}`);
        }
    }

    // Get all employees with optional filters
    async getAllEmployees(filters = {}) {
        try {
            const query = {};
            
            if (filters.status) query.status = filters.status;
            if (filters.department) query.department = filters.department;
            
            return await Employee.find().sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error fetching employees: ${error.message}`);
        }
    }

    // Get single employee by ID
    async getEmployeeById(id) {
        try {
            const employee = await Employee.findById(id);
            if (!employee) {
                throw new Error('Employee not found');
            }
            return employee;
        } catch (error) {
            throw new Error(`Error fetching employee: ${error.message}`);
        }
    }

    // Update employee with optional avatar update
   async updateEmployee(id, updateData) {
    try {
        console.log("updateData", updateData);
        
        if (updateData.avatar && !updateData.avatar.public_id) {
            delete updateData.avatar;
        }
        
        // If new avatar is provided with public_id, delete old one
        const employee = await Employee.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        // Handle avatar deletion if new avatar is provided
        if (updateData.avatar && updateData.avatar.public_id) {
            if (employee.avatar && employee.avatar.public_id) {
                try {
                    await deleteFromCloudinary(employee.avatar.public_id);
                } catch (cloudinaryError) {
                    console.error('Cloudinary deletion error:', cloudinaryError);
                    // Continue with update even if Cloudinary deletion fails
                }
            }
        }

        // Update using findByIdAndUpdate for proper Mongoose handling
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { $set: updateData }, // Use $set operator to update specific fields
            { 
                new: true, // Return updated document
                runValidators: true, // Run schema validators
                context: 'query' // Required for some validators
            }
        );

        if (!updatedEmployee) {
            throw new Error('Employee not found');
        }

        return updatedEmployee;
    } catch (error) {
        console.error('Update employee error:', error);
        throw new Error(`Error updating employee: ${error.message}`);
    }
}

    // Delete employee and their avatar from Cloudinary
    async deleteEmployee(id) {
        try {
            const employee = await Employee.findById(id);
            if (!employee) {
                throw new Error('Employee not found');
            }

           
            if (employee.avatar && employee.avatar.public_id) {
                await deleteFromCloudinary(employee.avatar.public_id);
            }

         
            await Employee.findByIdAndDelete(id);

            return { 
                message: 'Employee deleted successfully',
                deletedId: id 
            };
        } catch (error) {
            throw new Error(`Error deleting employee: ${error.message}`);
        }
    }

    // Change employee status
    async changeEmployeeStatus(id, status) {
        try {
            if (!['active', 'onleave', 'remote', 'inactive'].includes(status)) {
                throw new Error('Invalid status value');
            }

            const employee = await Employee.findByIdAndUpdate(
                id,
                { status },
                { new: true, runValidators: true }
            );
            
            if (!employee) {
                throw new Error('Employee not found');
            }
            return employee;
        } catch (error) {
            throw new Error(`Error changing status: ${error.message}`);
        }
    }

   async updatePassword(employeeId, currentPassword, newPassword) {
    try {
        const employee = await Employee.findById(employeeId).select('+password');
        if (!employee) {
            throw new Error('Employee not found');
        }
        
        // Verify current password
        const isPasswordValid = await employee.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        
        // Update password
        employee.password = newPassword;
        await employee.save();
        
        
        const employeeWithoutPassword = employee.toObject();
        delete employeeWithoutPassword.password;
        
        return employeeWithoutPassword;
    } catch (error) {
        throw error;
    }
}
}

export default new EmployeeService();