import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Base authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        projects: {
          include: {
            project: {
              select: {
                id: true,
                customProjectId: true,
                name: true
              }
            }
          },
          where: { isActive: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Role-based authorization middleware
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      message: "Access denied: Super Admin privileges required"
    });
  }
  
  next();
};

export const requireProjectAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: "Access denied: Admin privileges required"
    });
  }
  
  next();
};

// Check sub user limit for Project Admins
export const checkSubUserLimit = async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN') {
      return next(); // Super admin has no limits
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: "Access denied: Admin privileges required"
      });
    }

    // Count existing sub users created by this Project Admin
    const subUserCount = await prisma.user.count({
      where: {
        role: 'SUB_USER',
        createdById: req.user.id
      }
    });

    const SUB_USER_LIMIT = 5;
    if (subUserCount >= SUB_USER_LIMIT) {
      return res.status(400).json({ 
        message: `Sub user limit reached. Project Admins can create maximum ${SUB_USER_LIMIT} sub users.`,
        current: subUserCount,
        limit: SUB_USER_LIMIT
      });
    }

    next();
  } catch (error) {
    console.error('Sub user limit check error:', error);
    res.status(500).json({ message: 'Server error while checking sub user limit' });
  }
};

// Verify project access for users
export const verifyProjectAccess = async (req, res, next) => {
  try {
    const { customProjectId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Super Admin has access to all projects
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user has access to this specific project
    const hasAccess = req.user.projects?.some(
      userProject => userProject.project.customProjectId === customProjectId
    );

    if (!hasAccess) {
      return res.status(403).json({ 
        message: "Access denied: You don't have permission to access this project"
      });
    }

    next();
  } catch (error) {
    console.error('Project access verification error:', error);
    res.status(500).json({ message: 'Server error while verifying project access' });
  }
};

// Project token authentication for external access
export const authenticateProjectToken = async (req, res, next) => {
  try {
    const token = req.query.access_token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    // Verify the project access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'PROJECT_ACCESS') {
      return res.status(401).json({ message: "Invalid token type" });
    }

    // Get project and user details
    const project = await prisma.project.findUnique({
      where: { customProjectId: decoded.projectId }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    req.user = {
      id: decoded.userId,
      projectId: decoded.projectId,
      type: 'PROJECT_ACCESS'
    };
    req.project = project;
    req.token = token;
    next();
  } catch (err) {
    console.error('Project authentication error:', err);
    return res.status(403).json({ message: "Invalid project access token" });
  }
}; 