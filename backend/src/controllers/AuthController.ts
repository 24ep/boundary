import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models/UserModel';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';
import { generateVerificationCode } from '../utils/authUtils';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthController {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        userType,
      } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create verification code
      const verificationCode = generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user
      const user = new UserModel({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        userType: userType || 'hourse',
        subscriptionTier: 'free',
        isEmailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: verificationExpiry,
        preferences: {
          notifications: true,
          locationSharing: true,
          popupSettings: {
            enabled: true,
            frequency: 'daily',
            maxPerDay: 3,
            categories: ['announcement', 'promotion'],
          },
        },
      });

      await user.save();

      // Send verification email
      try {
        await sendEmail({
          to: email,
          subject: 'Welcome to Bondarys - Verify Your Email',
          template: 'email-verification',
          data: {
            firstName,
            verificationCode,
            appName: 'Bondarys',
          },
        });
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      // Save refresh token
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Remove sensitive data
      const userResponse = this.sanitizeUser(user);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      logger.error('Registration failed:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in',
        });
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      // Save refresh token
      user.refreshTokens.push(refreshToken);
      user.lastLogin = new Date();
      await user.save();

      // Remove sensitive data
      const userResponse = this.sanitizeUser(user);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      logger.error('Login failed:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
      });
    }
  }

  // SSO Login
  async ssoLogin(req: Request, res: Response) {
    try {
      const { provider, ...ssoData } = req.body;

      let userData: any = {};

      switch (provider) {
        case 'google':
          userData = await this.verifyGoogleToken(ssoData.idToken);
          break;
        case 'facebook':
          userData = await this.verifyFacebookToken(ssoData.accessToken);
          break;
        case 'apple':
          userData = await this.verifyAppleToken(ssoData.identityToken);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported SSO provider',
          });
      }

      // Find or create user
      let user = await UserModel.findOne({ email: userData.email });

      if (!user) {
        // Create new user from SSO
        user = new UserModel({
          email: userData.email,
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
          avatar: userData.avatar,
          userType: 'hourse',
          subscriptionTier: 'free',
          isEmailVerified: true, // SSO users are pre-verified
          ssoProvider: provider,
          ssoProviderId: userData.id || userData.userId,
          preferences: {
            notifications: true,
            locationSharing: true,
            popupSettings: {
              enabled: true,
              frequency: 'daily',
              maxPerDay: 3,
              categories: ['announcement', 'promotion'],
            },
          },
        });

        await user.save();
        logger.info(`New SSO user created: ${userData.email} via ${provider}`);
      } else {
        // Update existing user's SSO info
        user.ssoProvider = provider;
        user.ssoProviderId = userData.id || userData.userId;
        user.lastLogin = new Date();
        await user.save();
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      // Save refresh token
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Remove sensitive data
      const userResponse = this.sanitizeUser(user);

      logger.info(`SSO login successful: ${userData.email} via ${provider}`);

      res.json({
        success: true,
        message: 'SSO login successful',
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      logger.error('SSO login failed:', error);
      res.status(500).json({
        success: false,
        message: 'SSO login failed',
      });
    }
  }

  // Verify Google token
  private async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token');
      }

      return {
        id: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        avatar: payload.picture,
      };
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  // Verify Facebook token
  private async verifyFacebookToken(accessToken: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error('Invalid Facebook token');
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.picture?.data?.url,
      };
    } catch (error) {
      logger.error('Facebook token verification failed:', error);
      throw new Error('Invalid Facebook token');
    }
  }

  // Verify Apple token
  private async verifyAppleToken(identityToken: string) {
    try {
      // In production, you should verify the Apple ID token with Apple's servers
      // For now, we'll decode the JWT to get user info
      const decoded = jwt.decode(identityToken) as any;
      
      if (!decoded) {
        throw new Error('Invalid Apple token');
      }

      return {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      };
    } catch (error) {
      logger.error('Apple token verification failed:', error);
      throw new Error('Invalid Apple token');
    }
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const userResponse = this.sanitizeUser(user);

      res.json({
        success: true,
        user: userResponse,
      });
    } catch (error) {
      logger.error('Get current user failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user data',
      });
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Check if refresh token exists in user's tokens
      if (!user.refreshTokens.includes(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      // Update refresh tokens
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      await user.save();

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      logger.error('Token refresh failed:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }

  // Logout
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;

      if (refreshToken && userId) {
        // Remove refresh token from user
        await UserModel.findByIdAndUpdate(userId, {
          $pull: { refreshTokens: refreshToken },
        });
      }

      logger.info(`User logged out: ${userId}`);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
        });
      }

      if (user.emailVerificationCode !== code) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code',
        });
      }

      if (user.emailVerificationExpiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired',
        });
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationExpiry = undefined;
      await user.save();

      logger.info(`Email verified: ${email}`);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Email verification failed:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
      });
    }
  }

  // Resend verification email
  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
        });
      }

      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.emailVerificationCode = verificationCode;
      user.emailVerificationExpiry = verificationExpiry;
      await user.save();

      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Bondarys - Verify Your Email',
        template: 'email-verification',
        data: {
          firstName: user.firstName,
          verificationCode,
          appName: 'Bondarys',
        },
      });

      logger.info(`Verification email resent: ${email}`);

      res.json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (error) {
      logger.error('Resend verification failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
      });
    }
  }

  // Complete onboarding
  async completeOnboarding(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { isOnboardingComplete: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const userResponse = this.sanitizeUser(user);

      logger.info(`Onboarding completed: ${user.email}`);

      res.json({
        success: true,
        message: 'Onboarding completed successfully',
        user: userResponse,
      });
    } catch (error) {
      logger.error('Onboarding completion failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete onboarding',
      });
    }
  }

  // Generate access token
  private generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
  }

  // Generate refresh token
  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }

  // Sanitize user data
  private sanitizeUser(user: any) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    delete userObj.emailVerificationCode;
    delete userObj.emailVerificationExpiry;
    return userObj;
  }
} 