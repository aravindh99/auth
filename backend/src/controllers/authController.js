import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import emailService from '../utils/emailService.js';
import otpService from '../utils/otpService.js';
import jwtService from '../utils/jwtService.js';

const prisma = new PrismaClient();

class AuthController {
  // Super Admin Registration with OTP verification
  async registerSuperAdmin(req, res) {
    try {
      const { name, email, password, companyName } = req.body;

      // Check if Super Admin already exists
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
      });

      if (existingSuperAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Super Admin already exists. Only one Super Admin is allowed.',
        });
      }

      // Check if email is already registered
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered.',
        });
      }

      // Check for recent OTP request
      const hasRecentOTP = await otpService.hasRecentOTP(email, 'REGISTRATION');
      if (hasRecentOTP) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP.',
        });
      }

      // Generate and send OTP
      const { otp } = await otpService.createOTP(email, 'REGISTRATION');
      const emailResult = await emailService.sendOTP(email, otp, 'REGISTRATION');

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.',
          error: emailResult.error,
        });
      }

      // Store registration data temporarily (you might want to use Redis or session storage in production)
      // For now, we'll assume the frontend handles this and sends all data in verify-otp

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
      });
    } catch (error) {
      console.error('Super Admin registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Verify OTP and complete Super Admin registration
  async verifySuperAdminOTP(req, res) {
    try {
      const { name, email, password, companyName, otp } = req.body;

      // Verify OTP
      const otpResult = await otpService.verifyOTP(email, otp, 'REGISTRATION');
      if (!otpResult.valid) {
        return res.status(400).json({
          success: false,
          message: otpResult.message,
        });
      }

      // Double-check Super Admin doesn't exist
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
      });

      if (existingSuperAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Super Admin already exists.',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create Super Admin
      const superAdmin = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          companyName,
          isActive: true,
        },
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(email, name, 'Super Admin');

      // Generate tokens
      const accessToken = jwtService.generateAccessToken(superAdmin, []);
      const refreshToken = await jwtService.generateRefreshToken(superAdmin.id);

      return res.status(201).json({
        success: true,
        message: 'Super Admin registered successfully.',
        data: {
          user: {
            id: superAdmin.id,
            name: superAdmin.name,
            email: superAdmin.email,
            role: superAdmin.role,
            companyName: superAdmin.companyName,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Super Admin OTP verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Account activation for newly created users
  async activateAccount(req, res) {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const otpResult = await otpService.verifyOTP(email, otp, 'ACCOUNT_ACTIVATION');
      if (!otpResult.valid) {
        return res.status(400).json({
          success: false,
          message: otpResult.message,
        });
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      if (user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Account is already activated.',
        });
      }

      // Activate the user
      await prisma.user.update({
        where: { email },
        data: { isActive: true },
      });

      // Send welcome email after activation
      await emailService.sendWelcomeEmail(email, user.name, 
        user.role === 'ADMIN' ? 'Project Admin' : 
        user.role === 'SUB_USER' ? `Sub User (${user.customRole})` : 
        user.role
      );

      return res.status(200).json({
        success: true,
        message: 'Account activated successfully. You can now log in.',
      });
    } catch (error) {
      console.error('Account activation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Universal login for all user types
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  customProjectId: true,
                  name: true,
                  icon: true,
                  description: true,
                  projectUrl: true,
                  isActive: true,
                },
              },
            },
            where: {
              isActive: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account not activated. Please check your email for the activation OTP and verify your account first.',
        });
      }

      // Check if user is suspended
      if (user.isSuspended) {
        return res.status(401).json({
          success: false,
          message: user.suspensionReason 
            ? `Account suspended: ${user.suspensionReason}. Please contact support.`
            : 'Account suspended. Please contact support.',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const accessToken = jwtService.generateAccessToken(user, user.projects);
      const refreshToken = await jwtService.generateRefreshToken(user.id);

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            projects: user.projects.map(up => ({
              id: up.project.id,
              customProjectId: up.project.customProjectId,
              name: up.project.name,
              icon: up.project.icon,
              description: up.project.description,
              projectUrl: up.project.projectUrl,
            })),
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Forgot password - send OTP
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email address not registered. Please check your email or create an account.',
        });
      }

      // Check for recent OTP request
      const hasRecentOTP = await otpService.hasRecentOTP(email, 'FORGOT_PASSWORD');
      if (hasRecentOTP) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP.',
        });
      }

      // Generate and send OTP
      const { otp } = await otpService.createOTP(email, 'FORGOT_PASSWORD');
      const emailResult = await emailService.sendOTP(email, otp, 'FORGOT_PASSWORD');

      if (!emailResult.success) {
        console.error('Failed to send forgot password OTP:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Reset code sent to your email. Please check your inbox.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Send account activation OTP for existing users
  async sendActivationOTP(req, res) {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email address not registered. Please check your email or create an account.',
        });
      }

      // Check if user is already activated
      if (user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Account is already activated. You can log in directly.',
        });
      }

      // Check for recent OTP request
      const hasRecentOTP = await otpService.hasRecentOTP(email, 'ACCOUNT_ACTIVATION');
      if (hasRecentOTP) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP.',
        });
      }

      // Generate and send OTP
      const { otp } = await otpService.createOTP(email, 'ACCOUNT_ACTIVATION');
      const emailResult = await emailService.sendAccountActivationOTP(
        email, 
        user.name, 
        otp, 
        user.role === 'ADMIN' ? 'Project Admin' : 
        user.role === 'SUB_USER' ? `Sub User (${user.customRole})` : 
        user.role
      );

      if (!emailResult.success) {
        console.error('Failed to send account activation OTP:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Account activation OTP sent to your email. Please check your inbox.',
      });
    } catch (error) {
      console.error('Send activation OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Reset password with OTP verification
  async resetPassword(req, res) {
    try {
      const { email, otp, password } = req.body;

      // Verify OTP
      const otpResult = await otpService.verifyOTP(email, otp, 'FORGOT_PASSWORD');
      if (!otpResult.valid) {
        return res.status(400).json({
          success: false,
          message: otpResult.message,
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Revoke all existing refresh tokens for security
      await jwtService.revokeAllUserTokens(user.id);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully. Please login with your new password.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required.',
        });
      }

      // Verify refresh token
      const tokenData = await jwtService.verifyRefreshToken(refreshToken);
      
      // Get updated user data with projects
      const user = await prisma.user.findUnique({
        where: { id: tokenData.user.id },
        include: {
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  customProjectId: true,
                  name: true,
                  icon: true,
                  description: true,
                  projectUrl: true,
                  isActive: true,
                },
              },
            },
            where: {
              isActive: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive.',
        });
      }

      // Generate new access token
      const newAccessToken = jwtService.generateAccessToken(user, user.projects);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully.',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
        error: error.message,
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await jwtService.revokeRefreshToken(refreshToken);
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Validate token (for external projects)
  async validateToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required.',
        });
      }

      const decoded = jwtService.verifyAccessToken(token);

      return res.status(200).json({
        success: true,
        message: 'Token is valid.',
        data: {
          user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            project: decoded.project || null,
          },
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
        error: error.message,
      });
    }
  }

  // Generate Project-Specific Token for Redirection
  async generateProjectToken(req, res) {
    try {
      const { customProjectId } = req.params;

      let project, userProject;

      if (req.user.role === 'SUPER_ADMIN') {
        // Super Admin can access any project
        project = await prisma.project.findUnique({
          where: { customProjectId },
          select: {
            id: true,
            customProjectId: true,
            name: true,
            projectUrl: true,
          },
        });

        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Project not found.',
          });
        }
      } else {
        // Find user's access to this project for non-super admins
        userProject = await prisma.userProject.findFirst({
          where: {
            userId: req.user.id,
            project: { customProjectId },
            isActive: true,
          },
          include: {
            project: {
              select: {
                id: true,
                customProjectId: true,
                name: true,
                projectUrl: true,
              },
            },
          },
        });

        if (!userProject) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to this project.',
          });
        }

        project = userProject.project;
      }

      // Generate project-specific token
      const projectToken = jwtService.generateProjectToken(req.user, project);

      // Get the project URL (user-specific for regular users, default for super admin)
      const redirectUrl = req.user.role === 'SUPER_ADMIN' 
        ? project.projectUrl 
        : (userProject.projectUrl || project.projectUrl);

      if (!redirectUrl) {
        return res.status(400).json({
          success: false,
          message: 'Project URL not configured.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Project token generated successfully.',
        data: {
          projectToken,
          redirectUrl,
          project: {
            id: project.id,
            customProjectId: project.customProjectId,
            name: project.name,
          },
        },
      });
    } catch (error) {
      console.error('Generate project token error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Redirect to Project with Token
  async redirectToProject(req, res) {
    try {
      const { customProjectId } = req.params;

      let project, userProject;

      if (req.user.role === 'SUPER_ADMIN') {
        // Super Admin can access any project
        project = await prisma.project.findUnique({
          where: { customProjectId },
          select: {
            id: true,
            customProjectId: true,
            name: true,
            projectUrl: true,
          },
        });

        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Project not found.',
          });
        }
      } else {
        // Find user's access to this project for non-super admins
        userProject = await prisma.userProject.findFirst({
          where: {
            userId: req.user.id,
            project: { customProjectId },
            isActive: true,
          },
          include: {
            project: {
              select: {
                id: true,
                customProjectId: true,
                name: true,
                projectUrl: true,
              },
            },
          },
        });

        if (!userProject) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to this project.',
          });
        }

        project = userProject.project;
      }

      // Generate project-specific token
      const projectToken = jwtService.generateProjectToken(req.user, project);

      // Get the project URL (user-specific for regular users, default for super admin)
      const baseUrl = req.user.role === 'SUPER_ADMIN' 
        ? project.projectUrl 
        : (userProject.projectUrl || project.projectUrl);

      if (!baseUrl) {
        return res.status(400).json({
          success: false,
          message: 'Project URL not configured.',
        });
      }

      // Update last accessed time (only for non-super admins with user-project relationship)
      if (req.user.role !== 'SUPER_ADMIN' && userProject) {
        await prisma.userProject.update({
          where: {
            userId_projectId: {
              userId: req.user.id,
              projectId: project.id,
            },
          },
          data: { lastAccessed: new Date() },
        });
      }

      // Build redirect URL with token
      const url = new URL(baseUrl);
      url.searchParams.append('access_token', projectToken);
      url.searchParams.append('user_id', req.user.id);
      url.searchParams.append('user_role', req.user.role);
      url.searchParams.append('project_id', project.customProjectId);

      // Redirect to the project
      return res.redirect(url.toString());
    } catch (error) {
      console.error('Redirect to project error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Test endpoint to decode JWT token and show its contents
  async decodeToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'No token provided',
        });
      }

      const decoded = jwtService.verifyAccessToken(token);
      
      return res.status(200).json({
        success: true,
        message: 'Token decoded successfully',
        data: {
          tokenPayload: decoded,
          tokenStructure: {
            userInfo: {
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              customRole: decoded.customRole || 'N/A (Only for Sub Users)',
            },
            companyInfo: {
              companyName: decoded.companyName || 'N/A',
              companyAddress: decoded.companyAddress || 'N/A',
              companyPhone: decoded.companyPhone || 'N/A',
            },
            accountStatus: {
              isActive: decoded.isActive,
              isSuspended: decoded.isSuspended,
              createdAt: decoded.createdAt,
            },
            projectAccess: decoded.projects || [],
            tokenInfo: {
              issuedAt: new Date(decoded.iat * 1000).toISOString(),
              expiresAt: new Date(decoded.exp * 1000).toISOString(),
            }
          }
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token',
        error: error.message,
      });
    }
  }

  // Check if Super Admin exists
  async checkSuperAdminExists(req, res) {
    try {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true, name: true, email: true, createdAt: true }
      });

      return res.status(200).json({
        success: true,
        exists: !!existingSuperAdmin,
        data: existingSuperAdmin ? {
          name: existingSuperAdmin.name,
          email: existingSuperAdmin.email,
          createdAt: existingSuperAdmin.createdAt
        } : null
      });
    } catch (error) {
      console.error('Check Super Admin exists error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Get user projects
  async getUserProjects(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  customProjectId: true,
                  name: true,
                  icon: true,
                  description: true,
                  projectUrl: true,
                },
              },
            },
            where: { isActive: true },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User projects retrieved successfully.',
        data: {
          projects: user.projects.map(up => ({
            id: up.project.id,
            customProjectId: up.project.customProjectId,
            name: up.project.name,
            icon: up.project.icon,
            description: up.project.description,
            projectUrl: up.project.projectUrl,
            lastAccessed: up.lastAccessed,
          })),
        },
      });
    } catch (error) {
      console.error('Get user projects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }
}

export default new AuthController();
      