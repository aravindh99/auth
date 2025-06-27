import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// JWT utilities
const signToken = (payload, expiresIn = '8h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Logging utility
const logUserAction = async (userId, action, projectId, details, req) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        projectId,
        details: { message: details },
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        success: true
      }
    });
  } catch (error) {
    console.error('Failed to log user action:', error);
  }
};

// For individual project backends to validate JWT tokens
export const validateJWTToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.access_token;
    
    if (!token) {
      return res.status(401).json({ 
        valid: false, 
        message: 'No token provided' 
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        companyName: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        valid: false, 
        message: 'User not found or inactive' 
      });
    }

    // For project-specific tokens, verify project access
    if (decoded.type === 'PROJECT_ACCESS') {
      const userProject = await prisma.userProject.findFirst({
        where: {
          userId: decoded.userId,
          project: { customProjectId: decoded.projectId },
          isActive: true
        },
        include: {
          project: {
            select: {
              id: true,
              customProjectId: true,
              name: true,
              isActive: true
            }
          }
        }
      });

      if (!userProject || !userProject.project.isActive) {
        return res.status(403).json({ 
          valid: false, 
          message: 'No access to this project' 
        });
      }

      // Update last accessed time
      await prisma.userProject.update({
        where: { 
          userId_projectId: {
            userId: decoded.userId,
            projectId: userProject.project.id
          }
        },
        data: { lastAccessed: new Date() }
      });

      await logUserAction(
        decoded.userId, 
        'PROJECT_TOKEN_VERIFIED', 
        userProject.project.id, 
        `Project access verified for ${userProject.project.name}`, 
        req
      );

      return res.json({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          systemRole: user.role,
          companyName: user.companyName
        },
        projectAccess: {
          projectId: userProject.project.customProjectId,
          projectName: userProject.project.name,
          hasAccess: true
        },
        tokenInfo: {
          type: decoded.type,
          expiresAt: new Date(decoded.exp * 1000)
        }
      });
    }

    // For main access tokens, return user info and all accessible projects
    const userProjects = await prisma.userProject.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        project: {
          select: {
            id: true,
            customProjectId: true,
            name: true,
            projectUrl: true,
            isActive: true
          }
        }
      }
    });

    const projectAccess = userProjects.map(up => ({
      projectId: up.project.customProjectId,
      projectName: up.project.name,
      projectUrl: up.project.projectUrl
    }));

    await logUserAction(
      user.id, 
      'MAIN_TOKEN_VERIFIED', 
      null, 
      `Main session verified with access to ${userProjects.length} projects`, 
      req
    );

    res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        systemRole: user.role,
        companyName: user.companyName
      },
      projectAccess,
      tokenInfo: {
        type: 'MAIN',
        expiresAt: new Date(decoded.exp * 1000)
      }
    });

  } catch (err) {
    console.error('Token validation error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        valid: false, 
        message: 'Invalid token format' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false, 
        message: 'Token expired' 
      });
    }

    res.status(500).json({ 
      valid: false, 
      message: 'Internal server error' 
    });
  }
};

// For individual projects to check specific project access
export const checkProjectAccess = async (req, res) => {
  try {
    const { projectId } = req.params;
    const token = req.headers.authorization?.split(' ')[1] || req.query.access_token;

    if (!token) {
      return res.status(401).json({ 
        hasAccess: false, 
        message: 'No token provided' 
      });
    }

    const decoded = verifyToken(token);
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        hasAccess: false, 
        message: 'User not found or inactive' 
      });
    }

    // Check project access by customProjectId
    const userProject = await prisma.userProject.findFirst({
      where: {
        userId: user.id,
        project: { customProjectId: projectId },
        isActive: true
      },
      include: {
        project: {
          select: { 
            id: true, 
            customProjectId: true,
            name: true, 
            isActive: true 
          }
        }
      }
    });

    if (!userProject || !userProject.project.isActive) {
      await logUserAction(
        user.id, 
        'PROJECT_ACCESS_DENIED', 
        null, 
        `Access check failed for project ${projectId} - no permission`, 
        req
      );
      
      return res.status(403).json({ 
        hasAccess: false, 
        message: 'No access to this project' 
      });
    }

    // Update last accessed
    await prisma.userProject.update({
      where: { 
        userId_projectId: {
          userId: user.id,
          projectId: userProject.project.id
        }
      },
      data: { lastAccessed: new Date() }
    });

    await logUserAction(
      user.id, 
      'PROJECT_ACCESS_VERIFIED', 
      userProject.project.id, 
      `Access verified for ${userProject.project.name}`, 
      req
    );

    res.json({
      hasAccess: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      project: {
        id: userProject.project.customProjectId,
        name: userProject.project.name
      }
    });

  } catch (err) {
    console.error('Project access check error:', err);
    
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        hasAccess: false, 
        message: 'Invalid or expired token' 
      });
    }

    res.status(500).json({ 
      hasAccess: false, 
      message: 'Internal server error' 
    });
  }
};

// This endpoint is not needed in JWT-based auth but keeping for compatibility
export const generateProjectAccessToken = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Use the main authentication endpoints for project access.',
      endpoints: {
        projectToken: 'POST /api/auth/project-token/:customProjectId',
        redirect: 'GET /api/auth/redirect/:customProjectId'
      }
    });
  } catch (err) {
    console.error('Project access error:', err);
    res.status(500).json({ message: "Failed to generate project access token", error: err.message });
  }
};

export const redirectToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this project
    const userProject = await prisma.userProject.findFirst({
      where: { 
        userId, 
        projectId: parseInt(projectId),
        isActive: true
      },
      include: { project: true }
    });

    if (!userProject) {
      await logUserAction(userId, 'PROJECT_ACCESS_DENIED', parseInt(projectId), 'User attempted unauthorized access', req);
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    if (!userProject.project.url) {
      return res.status(400).json({ message: 'Project URL not configured' });
    }

    // Generate short-lived access token
    const projectToken = signToken({
      userId,
      projectId: parseInt(projectId),
      projectRole: userProject.role,
      organizationId: userProject.project.organizationId,
      type: 'PROJECT_ACCESS'
    }, '1h'); // 1 hour expiry for redirect

    // Log project access
    await logUserAction(userId, 'PROJECT_REDIRECT', parseInt(projectId), `Redirected to: ${userProject.project.url}`, req);

    // Redirect to project with token
    const redirectUrl = `${userProject.project.url}?access_token=${projectToken}&user_role=${userProject.role}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Project redirect error:', err);
    res.status(500).json({ message: "Failed to redirect to project", error: err.message });
  }
};

export const verifyProjectAccess = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check current access
    const userProject = await prisma.userProject.findFirst({
      where: { 
        userId, 
        projectId: parseInt(projectId),
        isActive: true
      },
      include: { 
        project: true,
        user: {
          select: { fullName: true, email: true, role: true }
        }
      }
    });

    res.json({
      hasAccess: !!userProject,
      userRole: userProject?.role || null,
      project: userProject?.project || null,
      user: userProject?.user || null
    });
  } catch (err) {
    console.error('Verify project access error:', err);
    res.status(500).json({ message: "Failed to verify project access", error: err.message });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const userProjects = await prisma.userProject.findMany({
      where: {
        userId,
        project: {
          isActive: true
        }
      },
      include: {
        project: {
          select: {
            id: true,
            customProjectId: true,
            name: true,
            icon: true,
            description: true,
            projectUrl: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    const projects = userProjects.map(up => ({
      id: up.project.id,
      customProjectId: up.project.customProjectId,
      name: up.project.name,
      icon: up.project.icon,
      description: up.project.description,
      projectUrl: up.project.projectUrl,
      createdAt: up.project.createdAt,
      updatedAt: up.project.updatedAt
    }));

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Error getting user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user projects'
    });
  }
};

// Get project access
async getProjectAccess(req, res) {
  try {
    const { projectId } = req.params;

    const userProject = await prisma.userProject.findFirst({
      where: {
        userId: req.user.id,
        projectId: parseInt(projectId),
        isActive: true,
      },
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
    });

    if (!userProject) {
      return res.status(404).json({
        success: false,
        message: 'Project access not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project access retrieved successfully.',
      data: {
        project: {
          id: userProject.project.id,
          customProjectId: userProject.project.customProjectId,
          name: userProject.project.name,
          icon: userProject.project.icon,
          description: userProject.project.description,
          projectUrl: userProject.project.projectUrl,
          lastAccessed: userProject.lastAccessed,
        },
      },
    });
  } catch (error) {
    console.error('Get project access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
} 