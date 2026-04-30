import express from 'express';
const router = express.Router();
import { upload } from '../middleware/multer.js';
import AuthMiddleware from '../middleware/auth.js';
import { body } from 'express-validator';
import { 
    createEmployee, 
    getAllEmployees, 
    getEmployee, 
    updateEmployee, 
    deleteEmployee, 
    changeEmployeeStatus ,
    updateProfile,
    updatePassword
} from '../controller/EmployeeController.js';

router.use(AuthMiddleware.protect);

router.post('/create-employee', upload.single('avatar'), createEmployee);
router.get('/get-all-employees', getAllEmployees);

 
router.get('/employee/:id', getEmployee);
router.put('/update-employee/:id', upload.single('avatar'), updateEmployee);

 
router.delete('/delete-employee/:id', deleteEmployee);
router.patch('/:id/status', changeEmployeeStatus);

router.put(
    '/profile',
    upload.single('avatar'), 
    [
        body('firstName').optional().trim().notEmpty(),
        body('lastName').optional().trim().notEmpty(),
        body('email').optional().isEmail().normalizeEmail(),
        body('phone').optional().trim().notEmpty(),
        body('address').optional().trim().notEmpty(),
        body('birthDate').optional().isISO8601().toDate(),
        body('emergencyContact.name').optional().trim().notEmpty(),
        body('emergencyContact.phone').optional().trim().notEmpty(),
        body('emergencyContact.relationship').optional().trim().notEmpty(),
        body('bankDetails.accountNumber').optional().trim().notEmpty(),
        body('bankDetails.bankName').optional().trim().notEmpty(),
        body('bankDetails.ifscCode').optional().trim().notEmpty()
    ],
    updateProfile
);

router.put('/update-profile', upload.single('avatar'), updateProfile);
router.put('/update-password', updatePassword);
    
export default router;