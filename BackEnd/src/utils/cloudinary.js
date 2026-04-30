import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

 

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",  
      folder: "employee_avatars",  
    });

  
    fs.unlinkSync(localFilePath);
    
    return {
      public_id: response.public_id,
      url: response.secure_url
    };
  } catch (error) {
    
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

 
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};