 import { AdminService } from "../services/adminService.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
export default class AdminController {
      // ========== USER REGISTRATION ==========
  static register = asyncHandler(async (req, res, next) => {
    const result = await AdminService.register(
      req.body,
    );
    // Set cookies
    this.setAuthCookies(res, result.tokens);
    res.status(201).json(
      ApiResponse.success("User registered successfully", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      })
    );
  });

  // ========== USER LOGIN ==========
  static login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const result = await AdminService.login(
      email,
      password,
    );
    

    // Set cookies
    this.setAuthCookies(res, result.tokens);
    res.status(200).json(
      ApiResponse.success("Login successful", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      })
    );
  });

  // ========== USER LOGOUT ==========
  static logout = asyncHandler(async (req, res, next) => {
    await AdminService.logout(req.user._id);
    this.clearAuthCookies(res);
    res.status(200).json(ApiResponse.success("Logged out successfully"));
  });
   

    static clearAuthCookies(res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }
  // ========== REFRESH ACCE
  // SS TOKEN ==========

  
  static refreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw new AppiError("Refresh token is required", 400);
    }

    const tokens = await AdminService.refreshToken(
      refreshToken,
    );
    
    // Set new cookies
    this.setAuthCookies(res, tokens);

    res.status(200).json(
      ApiResponse.success("Token refreshed successfully", {
        accessToken: tokens.accessToken,
      })
    );
  });


  // ========== GET CURRENT USER PROFILE ==========
  static getMe = asyncHandler(async (req, res, next) => {
    let user = null;
    user = await AdminService.getCurrentUser(req.user._id);
    res.status(200).json(
      ApiResponse.success("User retrieved successfully", { user })
    );
  });


    static setAuthCookies(res, tokens) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,  
    };

    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, 
    });
    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);
  }

// ========== UPDATE ADMIN PROFILE ==========
static updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const updateData = req.body;
  
  delete updateData.password;
  delete updateData.email;
  delete updateData.role;

  const updatedUser = await AdminService.updateProfile(userId, updateData);

  res.status(200).json(
    ApiResponse.success("Profile updated successfully", { 
      user: updatedUser 
    })
  );
});

// ========== UPDATE ADMIN PASSWORD ==========
static changePassword = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!currentPassword || !newPassword) {
    throw new AppiError("Current password and new password are required", 400);
  }

  if (currentPassword === newPassword) {
    throw new AppiError("New password must be different from current password", 400);
  }

  const updatedUser = await AdminService.changePassword(
    userId,
    currentPassword,
    newPassword
  );

  res.status(200).json(
    ApiResponse.success("Password updated successfully", { 
      user: updatedUser 
    })
  );
});
}