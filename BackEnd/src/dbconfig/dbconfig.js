import dotenv from "dotenv";
dotenv.config({path:'./.env'})
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
 
 
// Connect to MongoDB
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
        mongoose.connection.on('connected', () => {
            console.log('✅ Mongoose connected to DB');
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  Mongoose disconnected from DB');
        });
        
        return connection;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        throw new ApiError(500, 'Database connection failed', [], error.stack);
    }
};

 

export default connectDB;