import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

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

    // Verify user still has access to the project
    const userProject = await prisma.userProject.findFirst({
      where: {
        userId: decoded.userId,
        project: { customProjectId: decoded.projectId },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        },
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

    if (!userProject || !userProject.user.isActive || !userProject.project.isActive) {
      return res.status(401).json({ message: "Project access expired or invalid" });
    }

    req.user = {
      id: decoded.userId,
      projectId: decoded.projectId,
      projectRole: decoded.projectRole,
      type: 'PROJECT_ACCESS'
    };
    req.userProject = userProject;
    req.token = token;
    next();
  } catch (err) {
    console.error('Project authentication error:', err);
    return res.status(403).json({ message: "Invalid project access token" });
  }
}; 