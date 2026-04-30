import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AppiError from './ApiError.js';

class TokenService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  // Generate Access Token
  generateAccessToken(payload) {
    return jwt.sign(
      { 
        ...payload,
        type: 'access'
      },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    );
  }

  // Generate Refresh Token
  generateRefreshToken(payload) {
    return jwt.sign(
      { 
        ...payload,
        type: 'refresh'
      },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }

  // Generate Both Tokens
  generateTokens(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  // Verify Access Token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      if(error.name === 'TokenExpiredError') {
        throw new AppiError('Access token expired', 401);
      }
       throw new AppiError('Invalid or expired access token', 401);
    }
  }

  // Verify Refresh Token
  verifyRefreshToken(token) {
    try {
       return  jwt.verify(token, this.refreshTokenSecret);
    } catch (error) {
       throw new AppiError('Invalid or expired refresh token', 401);
    }
  }

  // Generate random token for password reset
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash reset token
  hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Decode token without verification
  decodeToken(token) {
    return jwt.decode(token);
  }
}

export default new TokenService();