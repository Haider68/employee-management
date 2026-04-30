// services/projectService.js
import Project from '../models/Project.js';
 import Employee from '../models/employe.js';

class ProjectService {
  // Create new project
  async createProject(projectData, createdBy) {
    try {
      // Validate team members exist
      if (projectData.teamMembers && projectData.teamMembers.length > 0) {
        const employees = await Employee.find({
          _id: { $in: projectData.teamMembers },
          status: 'active'
        });
        
        if (employees.length !== projectData.teamMembers.length) {
          throw new Error('One or more team members are invalid or inactive');
        }
      }
      
      const project = new Project({
        ...projectData,
        createdBy,
        lastUpdatedBy: createdBy
      });
      
      return await project.save();
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }
  
  // Get all projects with filters
  async getAllProjects(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
    //   let query = {};
      
    //   if (filters.status) {
    //     query.status = filters.status;
    //   }
      
    //   if (filters.client) {
    //     query.client = { $regex: filters.client, $options: 'i' };
    //   }
      
    //   if (filters.startDate || filters.endDate) {
    //     query.startDate = {};
    //     if (filters.startDate) query.startDate.$gte = new Date(filters.startDate);
    //     if (filters.endDate) query.startDate.$lte = new Date(filters.endDate);
    //   }
      
      const [projects, total] = await Promise.all([
        Project.find()
          .populate('teamMembers', 'projectName email role')
          .populate('createdBy', 'firtName email')
          .populate('lastUpdatedBy', 'firtName email')
          .populate('teamMembers')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        
      ]);
      
      return {
        projects,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }
  
  // Get project by ID
  async getProjectById(projectId) {
    try {
      const project = await Project.findById(projectId)
        .populate('teamMembers', 'name email role department avatar')
        .populate('createdBy', 'name email role')
        .populate('lastUpdatedBy', 'name email role');
        
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
    } catch (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }
  
  // Update project
  async updateProject(projectId, updateData, updatedBy) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Validate team members if being updated
      if (updateData.teamMembers && updateData.teamMembers.length > 0) {
        const employees = await Employee.find({
          _id: { $in: updateData.teamMembers },
          status: 'active'
        });
        
        if (employees.length !== updateData.teamMembers.length) {
          throw new Error('One or more team members are invalid or inactive');
        }
      }
      
      // Update project
      Object.keys(updateData).forEach(key => {
        project[key] = updateData[key];
      });
      
      project.lastUpdatedBy = updatedBy;
      
      return await project.save();
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }
  
  // Update project status only
  async updateProjectStatus(projectId, status, updatedBy) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (!['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'].includes(status)) {
        throw new Error('Invalid status value');
      }
      
      return await project.updateStatus(status, updatedBy);
    } catch (error) {
      throw new Error(`Failed to update project status: ${error.message}`);
    }
  }
  
  // Delete project
  async deleteProject(projectId) {
    try {
      const project = await Project.findByIdAndDelete(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return { message: 'Project deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
  
  // Get project statistics
  async getProjectStats() {
    try {
      const stats = await Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ status: 'planning' }),
        Project.countDocuments({ status: 'in-progress' }),
        Project.countDocuments({ status: 'completed' }),
        Project.countDocuments({ deadline: { $lt: new Date() }, status: { $in: ['planning', 'in-progress'] } }),
        Project.aggregate([
          {
            $group: {
              _id: null,
              totalBudget: { $sum: '$budget' },
              avgBudget: { $avg: '$budget' }
            }
          }
        ])
      ]);
      
      return {
        totalProjects: stats[0],
        planning: stats[1],
        inProgress: stats[2],
        completed: stats[3],
        overdue: stats[4],
        totalBudget: stats[5][0]?.totalBudget || 0,
        averageBudget: stats[5][0]?.avgBudget || 0
      };
    } catch (error) {
      throw new Error(`Failed to fetch project statistics: ${error.message}`);
    }
  }
  
  // Add team member to project
  async addTeamMember(projectId, employeeId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      const employee = await Employee.findById(employeeId);
      
      if (!employee || employee.status !== 'active') {
        throw new Error('Employee not found or inactive');
      }
      
      return await project.addTeamMember(employeeId);
    } catch (error) {
      throw new Error(`Failed to add team member: ${error.message}`);
    }
  }
  
  // Remove team member from project
  async removeTeamMember(projectId, employeeId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return await project.removeTeamMember(employeeId);
    } catch (error) {
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  }
}

export default new ProjectService();