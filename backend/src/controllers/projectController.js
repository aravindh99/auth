import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ProjectController {
  // Create new project (Super Admin only)
  async createProject(req, res) {
    try {
      const { customProjectId, name, icon, description, projectUrl } = req.body;
      const userId = req.user.id;

      // Check if custom project ID already exists
      const existingProject = await prisma.project.findUnique({
        where: { customProjectId },
      });

      if (existingProject) {
        return res.status(400).json({
          success: false,
          message: 'Project ID already exists. Please choose a different ID.',
        });
      }

      // Create project
      const project = await prisma.project.create({
        data: {
          customProjectId,
          name,
          icon,
          description,
          projectUrl,
          createdBy: userId,
          isActive: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully.',
        data: {
          project: {
            id: project.id,
            customProjectId: project.customProjectId,
            name: project.name,
            icon: project.icon,
            description: project.description,
            projectUrl: project.projectUrl,
            isActive: project.isActive,
            createdAt: project.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Create project error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Get all projects (Super Admin) or user's projects (Admin/Sub User)
  async getProjects(req, res) {
    try {
      let projects;

      if (req.user.role === 'SUPER_ADMIN') {
        // Super Admin can see all projects
        projects = await prisma.project.findMany({
          where: { isActive: true },
          include: {
            users: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
              where: { isActive: true },
            },
            _count: {
              select: {
                users: {
                  where: { isActive: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        // Project Admin and Sub Users see only their assigned projects
        const userProjects = await prisma.userProject.findMany({
          where: {
            userId: req.user.id,
            isActive: true,
            project: {
              isActive: true  // Filter projects at the join level
            }
          },
          include: {
            project: true,  // Remove the invalid where clause
          },
        });

        projects = userProjects.map(up => up.project).filter(p => p !== null);
      }

      return res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully.',
        data: {
          projects: projects.map(project => ({
            id: project.id,
            customProjectId: project.customProjectId,
            name: project.name,
            icon: project.icon,
            description: project.description,
            projectUrl: project.projectUrl,
            isActive: project.isActive,
            userCount: project._count?.users || 0,
            createdAt: project.createdAt,
            users: req.user.role === 'SUPER_ADMIN' ? project.users?.map(up => up.user) : undefined,
          })),
        },
      });
    } catch (error) {
      console.error('Get projects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Get single project details
  async getProject(req, res) {
    try {
      const { customProjectId } = req.params;

      let project;

      if (req.user.role === 'SUPER_ADMIN') {
        // Super Admin can access any project
        project = await prisma.project.findUnique({
          where: { customProjectId },
          include: {
            users: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    lastLoginAt: true,
                  },
                },
              },
              where: { isActive: true },
            },
          },
        });
      } else {
        // Other users can only access projects they're assigned to
        const userProject = await prisma.userProject.findFirst({
          where: {
            userId: req.user.id,
            project: { customProjectId },
            isActive: true,
          },
          include: {
            project: {
              include: {
                users: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        lastLoginAt: true,
                      },
                    },
                  },
                  where: { isActive: true },
                },
              },
            },
          },
        });

        project = userProject?.project;
      }

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Project retrieved successfully.',
        data: {
          project: {
            id: project.id,
            customProjectId: project.customProjectId,
            name: project.name,
            icon: project.icon,
            description: project.description,
            projectUrl: project.projectUrl,
            isActive: project.isActive,
            createdAt: project.createdAt,
            users: project.users?.map(up => up.user) || [],
          },
        },
      });
    } catch (error) {
      console.error('Get project error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Update project (Super Admin only)
  async updateProject(req, res) {
    try {
      const { customProjectId } = req.params;
      const { name, icon, description, projectUrl } = req.body;

      // First check if user is super admin
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only Super Admin can update projects'
        });
      }

      const project = await prisma.project.findUnique({
        where: { customProjectId }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const updatedProject = await prisma.project.update({
        where: {
          id: project.id
        },
        data: {
          name: name || project.name,
          icon: icon || project.icon,
          description: description || project.description,
          projectUrl: projectUrl || project.projectUrl
        }
      });

      res.json({
        success: true,
        message: 'Project updated successfully',
        project: {
          id: updatedProject.id,
          customProjectId: updatedProject.customProjectId,
          name: updatedProject.name,
          icon: updatedProject.icon,
          description: updatedProject.description,
          projectUrl: updatedProject.projectUrl,
          updatedAt: updatedProject.updatedAt
        }
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update project'
      });
    }
  }

  // Delete project completely (Super Admin only)
  async deleteProject(req, res) {
    try {
      const { customProjectId } = req.params;

      const project = await prisma.project.findUnique({
        where: { customProjectId },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.',
        });
      }

      // Hard delete - completely remove project and related data
      await prisma.$transaction(async (tx) => {
        // Delete all user-project relationships first (foreign key constraint)
        await tx.userProject.deleteMany({
          where: { projectId: project.id },
        });

        // Delete audit logs related to this project
        await tx.auditLog.deleteMany({
          where: { projectId: project.id },
        });

        // Finally delete the project
        await tx.project.delete({
          where: { id: project.id },
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully.',
      });
    } catch (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  // Get project statistics (Super Admin only)
  async getProjectStats(req, res) {
    try {
      // Count all projects (both active and inactive)
      const totalProjects = await prisma.project.count();

      const totalUsers = await prisma.user.count({
        where: { 
          role: { not: 'SUPER_ADMIN' },
        },
      });

      const projectsWithUserCounts = await prisma.project.findMany({
        where: { isActive: true },
        select: {
          id: true,
          customProjectId: true,
          name: true,
          _count: {
            select: {
              users: {
                where: { isActive: true },
              },
            },
          },
        },
        orderBy: {
          users: {
            _count: 'desc',
          },
        },
        take: 5,
      });

      const recentProjects = await prisma.project.findMany({
        select: {
          id: true,
          customProjectId: true,
          name: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return res.status(200).json({
        success: true,
        message: 'Project statistics retrieved successfully.',
        data: {
          totalProjects,
          totalUsers,
          topProjects: projectsWithUserCounts.map(p => ({
            customProjectId: p.customProjectId,
            name: p.name,
            userCount: p._count.users,
          })),
          recentProjects: recentProjects.map(p => ({
            customProjectId: p.customProjectId,
            name: p.name,
            createdAt: p.createdAt,
          })),
        },
      });
    } catch (error) {
      console.error('Get project stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }
}

export default new ProjectController();
