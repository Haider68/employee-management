import EmployeeService from "../services/employeService.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";



const createEmployee = async (req, res) => {
    try {
        const employeeData = req.body;
        if(req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse) {
                employeeData.avatar = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.url
                };
            }
        }
        
        // Parse date fields
        if (employeeData.joinDate) {
            employeeData.joinDate = new Date(employeeData.joinDate);
        }
        if (employeeData.birthDate) {
            employeeData.birthDate = new Date(employeeData.birthDate);
        }

         

        const employee = await EmployeeService.createEmployee(employeeData);
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.department) filters.department = req.query.department;

        const employees = await EmployeeService.getAllEmployees(filters) 
        
        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getEmployee = async (req, res) => {
    try {
        const employee = await EmployeeService.getEmployeeById(req.params.id);
        
        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const updateData = req.body;
        // Handle avatar upload if new file provided
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse) {
                updateData.avatar = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.url
                };
            }
        }
        
        // Parse date fields if they exist
        if (updateData.joinDate && typeof updateData.joinDate === 'string') {
            updateData.joinDate = new Date(updateData.joinDate);
        }
        if (updateData.birthDate && typeof updateData.birthDate === 'string') {
            updateData.birthDate = new Date(updateData.birthDate);
        }

        // Remove empty strings to avoid overwriting with empty values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === '' || updateData[key] === null) {
                delete updateData[key];
            }
        });

        const employee = await EmployeeService.updateEmployee(
            req.params.id, 
            updateData
        );
        
        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        console.error('Update employee controller error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



const deleteEmployee = async (req, res) => {
    try {
        const result = await EmployeeService.deleteEmployee(req.params.id);
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const changeEmployeeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const employee = await EmployeeService.changeEmployeeStatus(req.params.id, status);
        
        res.status(200).json({
            success: true,
            message: `Employee status changed to ${status}`,
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const updateProfile = async (req, res) => {
    try {
        const employeeId = req.user.id;  
        const updateData = req.body;
        
        const restrictedFields = [
            'employeeId', 'department', 'designation', 'salary', 
            'joinDate', 'status', 'role', 'reportingTo', 'leaveBalance'
        ];
        
        restrictedFields.forEach(field => {
            if (updateData[field]) {
                delete updateData[field];
            }
        });
        
       
        let oldAvatarPublicId = null;
        if (req.file) {
             
            const currentEmployee = await EmployeeService.getEmployeeById(employeeId);
            
            if (currentEmployee.avatar?.public_id) {
                oldAvatarPublicId = currentEmployee.avatar.public_id;
            }
            
            // Upload new avatar
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse) {
                updateData.avatar = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.url
                };
            }
        }
        
     
        if (updateData.birthDate && typeof updateData.birthDate === 'string') {
            updateData.birthDate = new Date(updateData.birthDate);
        }
        
       
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === '' || updateData[key] === null) {
                delete updateData[key];
            }
        });
        
    
        const employee = await EmployeeService.updateEmployee(employeeId, updateData);
        
        
        if (oldAvatarPublicId) {
            try {
                await deleteFromCloudinary(oldAvatarPublicId);
            } catch (cloudinaryError) {
                console.error('Error deleting old avatar:', cloudinaryError);
               
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: employee
        });
    } catch (error) {
        console.error('Update profile controller error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const updatePassword = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }
        
        const employee = await EmployeeService.updatePassword(
            employeeId,
            currentPassword,
            newPassword
        );
        
        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            data: {
                id: employee._id,
                name: employee.name,
                email: employee.email
            }
        });
    } catch (error) {
        console.error('Update password controller error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export {
    createEmployee,
    getAllEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    changeEmployeeStatus,
    updateProfile,
    updatePassword
};