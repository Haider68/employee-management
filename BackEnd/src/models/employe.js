import mongoose from "mongoose"
import bcrypt from "bcrypt"
const employeeSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    department: {
        type: String,
        enum: ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations'],
        default: 'Engineering'
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['active', 'onleave', 'remote', 'inactive'],
        default: 'active'
    },
    birthDate: {
        type: Date
    },
    address: {
        type: String,
        trim: true
    },
    role:{
        type: String,
        enum: ["employee"],
        default: "employee",
    },
    avatar: {
        public_id: {
            type: String
        },
        url: {
            type: String,
        }
    },
    salary: {
        type: Number,
        default: 0
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    requiredHoursPerMonth: {
        type: Number,
        default: 160 // Standard 160 hours per month
    },
    overtimeRate: {
        type: Number,
        default: 0
    },
    password:{
     type: String
    }
}, {
    timestamps: true
});

// Add index for better query performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });


employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
     this.confirmpassword = undefined;
  } catch (error) {
    console.error("Password hashing error:", error);
    throw error;
  }
});

 
employeeSchema.methods.comparePassword = async function (candidatePassword) {
      
  return await bcrypt.compare(candidatePassword, this.password);
};


const Employee = mongoose.model('Employee', employeeSchema);

export default Employee