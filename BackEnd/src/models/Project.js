// models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value <= this.deadline;
      },
      message: 'Start date must be before or equal to deadline'
    }
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'Deadline must be after or equal to start date'
    }
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  projectDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
      message: 'Status must be one of: planning, in-progress, on-hold, completed, cancelled'
    },
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const timeDiff = this.deadline - today;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
});

// Virtual field for progress status
projectSchema.virtual('progressStatus').get(function() {
  if (this.status === 'completed') return 'Completed';
  if (this.status === 'cancelled') return 'Cancelled';
  
  const totalDays = this.deadline - this.startDate;
  const daysPassed = new Date() - this.startDate;
  const percentage = (daysPassed / totalDays) * 100;
  
  if (percentage < 0) return 'Not Started';
  if (percentage > 100) return 'Overdue';
  return `${Math.round(percentage)}% Complete`;
});

// Indexes for optimized queries
projectSchema.index({ status: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ 'teamMembers': 1 });

// Pre-save middleware
projectSchema.pre('save', function(next) {
  // Set lastUpdatedBy to createdBy if not set
  if (!this.lastUpdatedBy) {
    this.lastUpdatedBy = this.createdBy;
  }
  
  // Set completion date if status changes to completed
  if (this.isModified('status') && this.status === 'completed') {
    this.completionDate = new Date();
  }
});

// Static method to get projects by status
projectSchema.statics.findByStatus = async function(status) {
  return await this.find({ status }).populate('teamMembers', 'name role');
};

// Static method to get overdue projects
projectSchema.statics.findOverdue = async function() {
  return await this.find({
    deadline: { $lt: new Date() },
    status: { $in: ['planning', 'in-progress'] }
  });
};

// Instance method to add team member
projectSchema.methods.addTeamMember = async function(employeeId) {
  if (!this.teamMembers.includes(employeeId)) {
    this.teamMembers.push(employeeId);
    await this.save();
  }
  return this;
};

// Instance method to remove team member
projectSchema.methods.removeTeamMember = async function(employeeId) {
  this.teamMembers = this.teamMembers.filter(id => !id.equals(employeeId));
  await this.save();
  return this;
};

// Instance method to update status
projectSchema.methods.updateStatus = async function(newStatus, updatedBy) {
  this.status = newStatus;
  this.lastUpdatedBy = updatedBy;
  
  if (newStatus === 'completed') {
    this.completionDate = new Date();
  }
  
  await this.save();
  return this;
};

export default mongoose.model('Project', projectSchema);