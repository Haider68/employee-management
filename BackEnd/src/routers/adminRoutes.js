import express from 'express';
 import AdminController from '../controller/AdminController.js';
import AuthMiddleware from '../middleware/auth.js';
const router = express.Router();

 
// ========== PUBLIC ROUTES ==========
router.post('/login', AdminController.login);
router.post('/refresh-token', AdminController.refreshToken);
router.post('/register', 
  AdminController.register 
);
// ========== PROTECTED ROUTES ==========
router.use(AuthMiddleware.protect);
router.post('/logout', AdminController.logout);
router.get('/me', AdminController.getMe);
router.put('/update-profile', AdminController.updateProfile);
router.put('/update-password', AdminController.changePassword);
    
export default router;