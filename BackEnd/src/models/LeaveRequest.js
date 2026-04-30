// models/LeaveRequest.js
import mongoose, { Schema } from "mongoose";

const leaveRequestSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    leave_type: {
        type: String,
        enum: ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'casual', 'compensatory'],
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    number_of_days: {
        type: Number,
        required: true,
        min: 0.5
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    approved_at: {
        type: Date,
        default: null
    },
    rejection_reason: {
        type: String,
        default: null,
        trim: true
    }
}, {
    timestamps: true
});

// Validation: Ensure end_date is after start_date
leaveRequestSchema.pre('save', function(next) {
    if (this.end_date <= this.start_date) {
        const error = new Error('End date must be after start date');
        return;
    }
    
    // Auto-calculate number_of_days if not provided
    if (!this.number_of_days || this.number_of_days <= 0) {
        const timeDiff = this.end_date.getTime() - this.start_date.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;  
        this.number_of_days = dayDiff;
    }
});

// Index for better query performance
leaveRequestSchema.index({ employee: 1, start_date: -1 });
leaveRequestSchema.index({ status: 1, start_date: -1 });
leaveRequestSchema.index({ leave_type: 1 });

export default mongoose.model('LeaveRequest', leaveRequestSchema);