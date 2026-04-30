// routes/projectRoutes.js
import express from 'express';
 import ProjectController from '../controller/ProjectController.js';
import { body, param, query } from 'express-validator';
 import AuthMiddleware from '../middleware/auth.js';
const router = express.Router();

// Apply authentication middleware to all routes
router.use(AuthMiddleware.protect);

const createProjectValidation = [
  body('projectName').notEmpty().withMessage('Project name is required'),
  body('client').notEmpty().withMessage('Client name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('deadline').isISO8601().withMessage('Valid deadline is required'),
  body('teamMembers').optional().isArray(),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
];

const updateProjectValidation = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('startDate').optional().isISO8601(),
  body('deadline').optional().isISO8601(),
  body('budget').optional().isNumeric(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'])
];

const statusValidation = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('status').isIn(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Valid status is required')
];

// Routes
router.post('/create-project', createProjectValidation, ProjectController.createProject);
router.get('/get-all-projects', ProjectController.getAllProjects);
router.get('/stats', ProjectController.getProjectStats);
router.get('/get-project/:id', param('id').isMongoId(), ProjectController.getProject);
router.put('/update-project/:id', updateProjectValidation, ProjectController.updateProject);
router.patch('/update-status/:id/status', statusValidation, ProjectController.updateProjectStatus);
router.delete('/delete-project/:id', param('id').isMongoId(), ProjectController.deleteProject);
router.post('/:id/team-members', ProjectController.addTeamMember);
router.delete('/:id/team-members/:employeeId', ProjectController.removeTeamMember);

export default router;