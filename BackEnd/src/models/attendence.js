import mongoose, { Schema } from "mongoose"

const attendanceSchema = new Schema({
    date: {
        type: String,
        required: true,
        
    },
    checkIn: {
        type: Date,
        default: Date.now  
    },
    checkOut: {
        type: Date
        
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'not-marked'],
        default: 'not-marked'
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    }
}, {
    timestamps: true
});

 
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.status === 'not-marked') {
    this.status = 'present';
  }
});

export default mongoose.model('Attendance', attendanceSchema);