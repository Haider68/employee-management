import express from 'express';
import salaryController from '../controller/salaryController.js';

const router = express.Router();

// Depending on your auth scheme you might want to add middleware like `isAuth`, `isAdmin`
router.post('/calculate', salaryController.calculateSalary);
router.post('/process-all', salaryController.processAllSalaries);
router.get('/records', salaryController.getRecords);
router.patch('/records/:id/status', salaryController.updateStatus);

export default router;
