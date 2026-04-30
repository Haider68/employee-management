import mongoose from "mongoose";
import bcrypt from "bcrypt";
 
const superAdminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

   
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      
    },

    phoneno: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },
 
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
    },
    role:{
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    confirmpassword: {
      type: String,
      validate: {
        validator: function (el) {
           if(!this.isModified('password')) return true
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
  },
);


superAdminSchema.pre("save", async function () {
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

 
superAdminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

 
 
const Admin = mongoose.model("Admin", superAdminSchema);

export default Admin;
