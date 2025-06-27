import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import emailService from '../utils/emailService.js';
import jwtService from '../utils/jwtService.js';

const prisma = new PrismaClient();

class UserManagementController {
  // Create Project Admin (Super Admin only)
  async createProjectAdmin(req, res) {
    try {
      // console.log('📝 CreateProjectAdmin called with body:', JSON.stringify(req.body, null, 2));
      
      const { name, email, password, companyName, companyAddress, companyPhone, projectAssignments, subUserLimit } = req.body;
      // projectAssignments format: [{ projectId: 1, projectUrl: "https://project1.com" }, ...]

      // Validate subUserLimit
      if (subUserLimit && (typeof subUserLimit !== 'number' || subUserLimit < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Sub user limit must be a non-negative number.',
        });
      }

      // console.log('🔍 Extracted fields:', {
      //   name,
      //   email,
      //   password: password ? '[HIDDEN]' : 'undefined',
      //   companyName,
      //   companyAddress,
      //   companyPhone,
      //   projectAssignments
      // });

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log('❌ User already exists:', email);
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }

      // Extract project IDs for validation
      const projectIds = projectAssignments.map(pa => pa.projectId);
      // console.log('🔍 Project IDs to validate:', projectIds);

      // Verify all project IDs exist
      const projects = await prisma.project.findMany({
        where: {
          id: { in: projectIds },
          isActive: true,
        },
      });

      // console.log('🔍 Found projects:', projects.length, 'Expected:', projectIds.length);

      if (projects.length !== projectIds.length) {
        // console.log('❌ Project ID validation failed. Found projects:', projects.map(p => p.id), 'Expected:', projectIds);
        return res.status(400).json({
          success: false,
          message: 'One or more project IDs are invalid.',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create Project Admin and assign projects in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN',
            companyName,
            companyAddress,
            companyPhone,
            createdById: req.user.id,
            isActive: false, // User inactive until email verification
            subUserLimit: subUserLimit || 5, // Default to 5 if not specified
          },
        });

        // Assign projects
        const projectAssignmentData = projectAssignments.map(pa => ({
          userId: newUser.id,
          projectId: pa.projectId,
          isActive: true,
        }));

        await tx.userProject.createMany({
          data: projectAssignmentData,
        });

        return newUser;
      });

      // Generate and send OTP for email verification
      const otpService = await import('../utils/otpService.js');
      const { otp } = await otpService.default.createOTP(email, 'ACCOUNT_ACTIVATION');
      const emailResult = await emailService.sendAccountActivationOTP(email, name, otp, 'Project Admin');

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'User created but failed to send verification email. Please contact admin.',
          error: emailResult.error,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Project Admin created successfully. Verification email sent. User must verify email before logging in.',
        data: {
          user: {
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
            companyName: result.companyName,
            companyAddress: result.companyAddress,
            companyPhone: result.companyPhone,
            createdAt: result.createdAt,
            isActive: result.isActive,
          },
          assignedProjects: projects.map(p => {
            const assignment = projectAssignments.find(pa => pa.projectId === p.id);
            return {
              id: p.id,
              customProjectId: p.customProjectId,
              name: p.name,
              projectUrl: p.projectUrl
            };
          }),
        },
      });
    } catch (error) {
      console.error('Create Project Admin error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Create Sub User (Project Admin only)
  async createSubUser(req, res) {
    try {
      const { name, email, password, role, projectAssignments } = req.body;
      // projectAssignments format: [{ projectId: 1, projectUrl: "https://project1.com" }, ...]

      // Get Project Admin's company information and sub-user limit
      const projectAdmin = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { 
          companyName: true, 
          companyAddress: true, 
          companyPhone: true,
          subUserLimit: true
        }
      });

      // Check if admin has reached their sub-user limit
      const existingSubUsers = await prisma.user.count({
        where: {
          createdById: req.user.id,
          role: 'SUB_USER'
        }
      });

      if (existingSubUsers >= projectAdmin.subUserLimit) {
        return res.status(403).json({
          success: false,
          message: `You have reached your sub-user limit of ${projectAdmin.subUserLimit}. Please contact the super admin to increase your limit.`,
        });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }

      // Extract project IDs for validation
      const projectIds = projectAssignments.map(pa => pa.projectId);

      // Verify Project Admin has access to all specified projects
      const adminProjects = await prisma.userProject.findMany({
        where: {
          userId: req.user.id,
          projectId: { in: projectIds },
          isActive: true,
        },
        include: {
          project: true,
        },
      });

      if (adminProjects.length !== projectIds.length) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to one or more of the specified projects.',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create Sub User and assign projects in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'SUB_USER',
            customRole: role, // Store the custom role text (e.g., "Developer", "Tester", etc.)
            companyName: projectAdmin.companyName,
            companyAddress: projectAdmin.companyAddress,
            companyPhone: projectAdmin.companyPhone,
            createdById: req.user.id,
            isActive: false, // User inactive until email verification
          },
        });

        // Assign projects
        const projectAssignmentData = projectAssignments.map(pa => ({
          userId: newUser.id,
          projectId: pa.projectId,
          isActive: true,
        }));

        await tx.userProject.createMany({
          data: projectAssignmentData,
        });

        return newUser;
      });

      // Generate and send OTP for email verification
      const otpService = await import('../utils/otpService.js');
      const { otp } = await otpService.default.createOTP(email, 'ACCOUNT_ACTIVATION');
      const emailResult = await emailService.sendAccountActivationOTP(email, name, otp, `Sub User (${role})`);

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'User created but failed to send verification email. Please contact admin.',
          error: emailResult.error,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Sub User created successfully. Verification email sent. User must verify email before logging in.',
        data: {
          user: {
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
            customRole: result.customRole, // Return the custom role text
            companyName: result.companyName,
            companyAddress: result.companyAddress,
            companyPhone: result.companyPhone,
            createdAt: result.createdAt,
            isActive: result.isActive,
          },
          assignedProjects: adminProjects.map(ap => {
            const assignment = projectAssignments.find(pa => pa.projectId === ap.project.id);
            return {
              id: ap.project.id,
              customProjectId: ap.project.customProjectId,
              name: ap.project.name,
              projectUrl: ap.project.projectUrl
            };
          }),
        },
      });
    } catch (error) {
      console.error('Create Sub User error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Get all users (Super Admin) or managed users (Project Admin)
  async getUsers(req, res) {
    try {
      let users;

      if (req.user.role === 'SUPER_ADMIN') {
        // Super Admin can see all users except themselves (including inactive for verification status)
        users = await prisma.user.findMany({
          where: {
            id: { not: req.user.id },
          },
          include: {
            projects: {
              include: {
                project: {
                  select: {
                    id: true,
                    customProjectId: true,
                    name: true,
                  },
                },
              },
              where: { isActive: true },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else if (req.user.role === 'ADMIN') {
        // Project Admin can see only their created Sub Users (including inactive for verification status)
        users = await prisma.user.findMany({
          where: {
            createdById: req.user.id,
            role: 'SUB_USER',
          },
          include: {
            projects: {
              include: {
                project: {
                  select: {
                    id: true,
                    customProjectId: true,
                    name: true,
                  },
                },
              },
              where: { isActive: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        // Sub Users cannot manage other users
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully.',
        data: {
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            customRole: user.customRole,
            companyName: user.companyName,
            companyAddress: user.companyAddress,
            companyPhone: user.companyPhone,
            isActive: user.isActive,
            isSuspended: user.isSuspended || false,
            suspendedAt: user.suspendedAt,
            suspensionReason: user.suspensionReason,
            subUserLimit: user.subUserLimit || 5,
            status: user.isSuspended 
              ? 'Suspended' 
              : user.isActive 
                ? 'Active' 
                : 'Pending Email Verification',
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
            projects: user.projects.map(up => ({
              ...up.project,
              projectUrl: up.project.projectUrl,
            })),
          })),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Get single user details
  async getUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          projects: {
            include: {
              project: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            customRole: user.customRole,
            companyName: user.companyName,
            isActive: user.isActive,
            status: user.isActive ? 'Active' : 'Pending Email Verification',
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
            projects: user.projects.map(up => ({
              ...up.project,
              projectUrl: up.project.projectUrl,
            })),
          },
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Update user (activate/deactivate, update project assignments)
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { isActive, projectAssignments, subUserLimit } = req.body;

      // Check permissions
      let user;
      if (req.user.role === 'SUPER_ADMIN') {
        user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
        });
      } else if (req.user.role === 'ADMIN') {
        user = await prisma.user.findFirst({
          where: { 
            id: parseInt(userId), 
            createdById: req.user.id,
            role: 'SUB_USER'
          },
        });
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found or access denied.',
        });
      }

      // Validate subUserLimit if provided
      if (subUserLimit !== undefined) {
        if (typeof subUserLimit !== 'number' || subUserLimit < 0) {
          return res.status(400).json({
            success: false,
            message: 'Sub user limit must be a non-negative number.',
          });
        }

        // Only Super Admin can update subUserLimit
        if (req.user.role !== 'SUPER_ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Only Super Admin can update sub-user limit.',
          });
        }

        // Can only update subUserLimit for Project Admins
        if (user.role !== 'ADMIN') {
          return res.status(400).json({
            success: false,
            message: 'Sub-user limit can only be set for Project Admins.',
          });
        }
      }

      // Update user and project assignments in transaction
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Update user status and subUserLimit if provided
        const userData = {};
        if (isActive !== undefined) {
          userData.isActive = isActive;
        }
        if (subUserLimit !== undefined) {
          userData.subUserLimit = subUserLimit;
        }

        let updated = user;
        if (Object.keys(userData).length > 0) {
          updated = await tx.user.update({
            where: { id: parseInt(userId) },
            data: userData,
          });
        }

        // Update project assignments if provided
        if (projectAssignments && Array.isArray(projectAssignments)) {
          const projectIds = projectAssignments.map(pa => pa.projectId);

          // Verify access to projects
          let availableProjects;
          if (req.user.role === 'SUPER_ADMIN') {
            availableProjects = await tx.project.findMany({
              where: { id: { in: projectIds }, isActive: true },
            });
          } else {
            const adminProjects = await tx.userProject.findMany({
              where: {
                userId: req.user.id,
                projectId: { in: projectIds },
                isActive: true,
              },
            });
            availableProjects = adminProjects.map(ap => ({ id: ap.projectId }));
          }

          if (availableProjects.length !== projectIds.length) {
            throw new Error('Access denied to one or more projects');
          }

          // Remove existing assignments
          await tx.userProject.updateMany({
            where: { userId: parseInt(userId) },
            data: { isActive: false },
          });

          // Add new assignments with custom URLs
          const assignments = projectAssignments.map(pa => ({
            userId: parseInt(userId),
            projectId: pa.projectId,
            isActive: true,
          }));

          await tx.userProject.createMany({
            data: assignments,
          });

          // If this is a Project Admin, update their sub-users' project URLs
          if (user.role === 'ADMIN') {
            // Get all sub-users
            const subUsers = await tx.user.findMany({
              where: {
                createdById: parseInt(userId),
                role: 'SUB_USER',
              },
            });

            if (subUsers.length > 0) {
              // For each sub-user, update their project assignments with the same URLs
              for (const subUser of subUsers) {
                // Remove existing assignments
                await tx.userProject.updateMany({
                  where: { userId: subUser.id },
                  data: { isActive: false },
                });

                // Add new assignments with the same URLs as the Project Admin
                const subUserAssignments = projectAssignments.map(pa => ({
                  userId: subUser.id,
                  projectId: pa.projectId,
                  isActive: true,
                }));

                await tx.userProject.createMany({
                  data: subUserAssignments,
                });
              }
            }
          }
        }

        return updated;
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
            subUserLimit: updatedUser.subUserLimit,
            updatedAt: updatedUser.updatedAt,
          },
        },
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Delete user completely
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Check permissions
      let user;
      if (req.user.role === 'SUPER_ADMIN') {
        user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
        });
      } else if (req.user.role === 'ADMIN') {
        user = await prisma.user.findFirst({
          where: { 
            id: parseInt(userId), 
            createdById: req.user.id,
            role: 'SUB_USER'
          },
        });
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found or access denied.',
        });
      }

      // Hard delete - completely remove user and related data with cascading
      const result = await prisma.$transaction(async (tx) => {
        let deletedUsers = [user];
        let subUsersDeleted = 0;

        // If deleting a Project Admin, also delete their Sub Users (Cascading Delete)
        if (user.role === 'ADMIN') {
          const subUsers = await tx.user.findMany({
            where: { 
              createdById: parseInt(userId),
              role: 'SUB_USER'
            },
          });

          // Delete each sub user's related data
          for (const subUser of subUsers) {
            // Delete sub user's project assignments
            await tx.userProject.deleteMany({
              where: { userId: subUser.id },
            });

            // Delete sub user's refresh tokens
            await tx.refreshToken.deleteMany({
              where: { userId: subUser.id },
            });

            // Delete sub user's OTP requests
            await tx.otpRequest.deleteMany({
              where: { email: subUser.email },
            });

            // Delete sub user's audit logs
            await tx.auditLog.deleteMany({
              where: { userId: subUser.id },
            });

            // Delete the sub user
            await tx.user.delete({
              where: { id: subUser.id },
            });
          }

          deletedUsers = [...deletedUsers, ...subUsers];
          subUsersDeleted = subUsers.length;
        }

        // Delete main user's project assignments
        await tx.userProject.deleteMany({
          where: { userId: parseInt(userId) },
        });

        // Delete main user's refresh tokens
        await tx.refreshToken.deleteMany({
          where: { userId: parseInt(userId) },
        });

        // Delete main user's OTP requests
        await tx.otpRequest.deleteMany({
          where: { email: user.email },
        });

        // Delete main user's audit logs
        await tx.auditLog.deleteMany({
          where: { userId: parseInt(userId) },
        });

        // Finally delete the main user
        await tx.user.delete({
          where: { id: parseInt(userId) },
        });

        return { deletedUsers, subUsersDeleted };
      });

      const message = user.role === 'ADMIN' && result.subUsersDeleted > 0
        ? `Project Admin deleted successfully along with ${result.subUsersDeleted} Sub User(s).`
        : 'User deleted successfully.';

      return res.status(200).json({
        success: true,
        message,
        data: {
          deletedUsersCount: result.deletedUsers.length,
          subUsersDeleted: result.subUsersDeleted,
        },
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Super Admin only.',
        });
      }

      // Count all users (both active and inactive) excluding SUPER_ADMIN
      const totalUsers = await prisma.user.count({
        where: { 
          role: { not: 'SUPER_ADMIN' },
        },
      });

      const projectAdmins = await prisma.user.count({
        where: { 
          role: 'ADMIN',
        },
      });

      const subUsers = await prisma.user.count({
        where: { 
          role: 'SUB_USER',
        },
      });

      // Active users for recent users list
      const recentUsers = await prisma.user.findMany({
        where: { 
          role: { not: 'SUPER_ADMIN' },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully.',
        data: {
          totalUsers,
          projectAdmins,
          subUsers,
          recentUsers,
        },
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Update user project assignments
  async updateUserProjects(req, res) {
    try {
      const { userId } = req.params;
      const { projectAssignments } = req.body;

      // Only super admins can update user project assignments
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only Super Admins can update user project assignments.'
        });
      }

      // Validate user exists and is not a super admin
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { projects: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify super admin project assignments.'
        });
      }

      // Validate project IDs
      const projectIds = projectAssignments.map(pa => pa.projectId);
      
      // Verify all project IDs exist
      const availableProjects = await prisma.project.findMany({
        where: { id: { in: projectIds } }
      });

      if (availableProjects.length !== projectIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more project IDs are invalid.'
        });
      }

      // Update project assignments in transaction
      await prisma.$transaction(async (tx) => {
        // Remove existing assignments
        await tx.userProject.deleteMany({
          where: { userId: parseInt(userId) }
        });

        // Add new assignments
        if (projectAssignments.length > 0) {
          const assignments = projectAssignments.map(pa => ({
            userId: parseInt(userId),
            projectId: pa.projectId,
            isActive: true,
          }));

          await tx.userProject.createMany({
            data: assignments,
          });
        }
      });

      return res.status(200).json({
        success: true,
        message: 'User project assignments updated successfully.',
        data: {
          assignedProjects: availableProjects.map(p => ({
            id: p.id,
            customProjectId: p.customProjectId,
            name: p.name,
            projectUrl: p.projectUrl
          })),
        },
      });
    } catch (error) {
      console.error('Update user projects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Suspend user account
  async suspendUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      // Check if user exists and get their role
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Check permissions
      if (req.user.role === 'SUPER_ADMIN') {
        // Super Admin can suspend anyone except other Super Admins
        if (user.role === 'SUPER_ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Cannot suspend a Super Admin.',
          });
        }
      } else if (req.user.role === 'ADMIN') {
        // Admin can only suspend their own sub-users
        if (user.role !== 'SUB_USER') {
          return res.status(403).json({
            success: false,
            message: 'You can only suspend your own sub-users.',
          });
        }
        if (user.createdById !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'You can only suspend your own sub-users.',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to suspend users.',
        });
      }

      if (user.isSuspended) {
        return res.status(400).json({
          success: false,
          message: 'User is already suspended.',
        });
      }

      // Suspend user
      const suspendedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: reason || 'Suspended by administrator',
          suspendedBy: req.user.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'User suspended successfully.',
        data: {
          user: {
            id: suspendedUser.id,
            name: suspendedUser.name,
            email: suspendedUser.email,
            role: suspendedUser.role,
            isSuspended: suspendedUser.isSuspended,
            suspendedAt: suspendedUser.suspendedAt,
            suspensionReason: suspendedUser.suspensionReason,
          },
        },
      });
    } catch (error) {
      console.error('Suspend user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Unsuspend user account
  async unsuspendUser(req, res) {
    try {
      const { userId } = req.params;

      // Check if user exists and get their role
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Check permissions
      if (req.user.role === 'SUPER_ADMIN') {
        // Super Admin can unsuspend anyone except other Super Admins
        if (user.role === 'SUPER_ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Cannot unsuspend a Super Admin.',
          });
        }
      } else if (req.user.role === 'ADMIN') {
        // Admin can only unsuspend their own sub-users
        if (user.role !== 'SUB_USER' || user.createdById !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'You can only unsuspend your own sub-users.',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to unsuspend users.',
        });
      }

      if (!user.isSuspended) {
        return res.status(400).json({
          success: false,
          message: 'User is not suspended.',
        });
      }

      // Unsuspend user
      const unsuspendedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isSuspended: false,
          suspendedAt: null,
          suspensionReason: null,
          suspendedBy: null,
          unsuspendedAt: new Date(),
          unsuspendedBy: req.user.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'User unsuspended successfully.',
        data: {
          user: {
            id: unsuspendedUser.id,
            name: unsuspendedUser.name,
            email: unsuspendedUser.email,
            role: unsuspendedUser.role,
            isSuspended: unsuspendedUser.isSuspended,
            unsuspendedAt: unsuspendedUser.unsuspendedAt,
          },
        },
      });
    } catch (error) {
      console.error('Unsuspend user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }
}

export default new UserManagementController(); 