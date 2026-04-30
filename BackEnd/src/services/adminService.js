import Admin from "../models/admin.js";
import TokenService from "../utils/tokenService.js";
import ApiError from "../utils/ApiError.js";
import Employee from "../models/employe.js";
export class AdminService {
     static async register(userData) {
    try {
      const existingUser = await Admin.findOne({ 
        email: userData.email,
      });

      if (existingUser) {
        throw new ApiError('Email already exists', 400);
      }

      const userToCreate = {
        ...userData,
      };
      
 
      const newUser = await Admin.create(userToCreate);
      

      // Generate tokens
      const tokens = TokenService.generateTokens({
        id: newUser._id,
        email: newUser.email,
      });

      return {
        user: newUser,
        tokens
      };
    } catch (error) {
      throw error;
    }
  }




  static async login(email, password) {
  try {
    let user = null;
    user = await Admin.findOne({ email });
      if(!user){
         user = await Employee.findOne({ email });
      }

      if(!user){
        throw new ApiError('User not found', 404);
      }
        
       console.log("user",user);

    const isPasswordCorrect = await user.comparePassword(password);
     
    if (!isPasswordCorrect) {
      throw new ApiError('Incorrect Password', 401);
    }

    //  Token payload
    let tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const tokens = TokenService.generateTokens(tokenPayload);
    return {
      success: true,
      user: user,
      tokens,
      message: 'Login successful'
    };

  } catch (error) {
     console.log("error12",error);
    throw new ApiError(error || 'Login failed. Please try again later.', 500);
  }
  }



  static async refreshToken(refreshToken) {

  try {
    const decoded = TokenService.verifyRefreshToken(refreshToken);
    let user = null;
    user = await Admin.findById(decoded.id);
     
    if (!user) {
        user = await Employee.findById(decoded.id);
    }

   
    if(!user) throw new ApiError('User not found', 404);
 
    let tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role
    };


    const tokens = TokenService.generateTokens(tokenPayload);
    return tokens;

  } catch (error) {
    throw new ApiError('Invalid or expired refresh token', 401);
  }
}


  /**
   * Logout user
   */
  static async logout(userId) {
    try {
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }


static async getCurrentUser(userId) {
  try {
  let user = null;
  user = await Admin.findById(userId)
  
   
  if(!user) {

      user = await Employee.findById(userId)
     
  }
  if(!user) throw new ApiError('User not found', 404);
  return user
   
  } catch (error) {
        throw new ApiError('User not found', 404);
  }
}

// In AdminService.js
static async updateProfile(userId, updateData) {
  const user = await Admin.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { 
      new: true,  
      runValidators: true,  
      select: '-password -refreshToken'  
    }
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user;
}

static async changePassword(userId, currentPassword, newPassword) {
  // Find user
  const user = await Admin.findById(userId);
  
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError("Current password is incorrect", 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Return user without password
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  delete userWithoutPassword.refreshToken;
  return userWithoutPassword;
}

}