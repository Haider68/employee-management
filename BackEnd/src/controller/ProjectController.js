// controllers/projectController.js
import projectService from '../services/projectService.js';
import { validationResult } from 'express-validator';

class ProjectController {
  async createProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const { projectName, client, startDate, deadline, teamMembers, projectDescription, budget, priority, tags } = req.body;
      
      const projectData = {
        projectName,
        client,
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        teamMembers,
        projectDescription,
        budget: budget || 0,
        priority: priority || 'medium',
        tags: tags || []
      };
      
      const project = await projectService.createProject(projectData, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get all projects - GET /api/projects
  async getAllProjects(req, res) {
    try {
      const { status, client, startDate, endDate, page = 1, limit = 10 } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (client) filters.client = client;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      
      
      const result = await projectService.getAllProjects((page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get single project - GET /api/projects/:id
  async getProject(req, res) {
    try {
      const { id } = req.params;
      
      const project = await projectService.getProjectById(id);
      
      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Update project - PUT /api/projects/:id
  async updateProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      const updateData = req.body;
      
      // Convert dates if present
      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
      if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);
      
      const project = await projectService.updateProject(id, updateData, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Update project status only - PATCH /api/projects/:id/status
  async updateProjectStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      const { status } = req.body;
      
      const project = await projectService.updateProjectStatus(id, status, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Project status updated successfully',
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Delete project - DELETE /api/projects/:id
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      
      const result = await projectService.deleteProject(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get project statistics - GET /api/projects/stats
  async getProjectStats(req, res) {
    try {
      const stats = await projectService.getProjectStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Add team member - POST /api/projects/:id/team-members
  async addTeamMember(req, res) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }
      
      const project = await projectService.addTeamMember(id, employeeId);
      
      res.status(200).json({
        success: true,
        message: 'Team member added successfully',
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Remove team member - DELETE /api/projects/:id/team-members/:employeeId
  async removeTeamMember(req, res) {
    try {
      const { id, employeeId } = req.params;
      
      const project = await projectService.removeTeamMember(id, employeeId);
      
      res.status(200).json({
        success: true,
        message: 'Team member removed successfully',
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ProjectController();