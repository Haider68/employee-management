 
import ApiError from '../utils/ApiError.js';
import TokenService from '../utils/tokenService.js';
import Admin from '../models/admin.js';
import Employee from '../models/employe.js';
 

class AuthMiddleware {
 static protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
      
    
    if (!token) {
      throw new ApiError('You are not logged in. Please log in to get access.', 401);
    }

    // Verify token
    const decoded = TokenService.verifyAccessToken(token);

   

    let currentUser = null;
  
    // Try Admin
    currentUser = await Admin.findById(decoded.id)

    if(!currentUser){
       currentUser = await Employee.findById(decoded.id)
      
    }

    if(!currentUser) throw new ApiError('User not found', 404);
      
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};


 
  static restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.positionrole)) {
        return next(
          new ApiError('You do not have permission to perform this action.', 403)
        );
      }
      next();
    };
  };

}

export default AuthMiddleware;