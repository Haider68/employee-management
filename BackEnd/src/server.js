import dotenv from "dotenv"
dotenv.config({path:'./.env'})
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./dbconfig/dbconfig.js";
import adminRouter from "./routers/adminRoutes.js";
import employeeRouter from "./routers/employeRouter.js";
import {v2 as cloudinary} from "cloudinary";
import projectRouter from "./routers/projectRoutes.js";
import attendenceRouter from "./routers/attendanceRoutes.js";
import leaveRouter from "./routers/leaveRoutes.js";
import salaryRouter from "./routers/salaryRoutes.js";
const app = express();
  app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }));

  cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

 
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


const DbConnection = async () => {
  await connectDB();
};
DbConnection();

 
app.use(express.json({ limit: "50mb" }));  
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

 
app.use(cookieParser());
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/attendence", attendenceRouter);
app.use("/api/v1/leave", leaveRouter);
app.use("/api/v1/salary", salaryRouter);
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  } else {
    
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
        timestamp: new Date().toISOString(),
      });
    } else {
      
      res.status(500).json({
        success: false,
        message: "Something went wrong!",
        timestamp: new Date().toISOString(),
      });
    }
  }
});

 
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

 
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥:", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

 
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥:", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
