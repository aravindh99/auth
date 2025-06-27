import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const prisma = new PrismaClient();

class JWTService {
  generateAccessToken(user, projects = []) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customRole: user.customRole,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyPhone: user.companyPhone,
      isActive: user.isActive,
      isSuspended: user.isSuspended || false,
      createdAt: user.createdAt,
      projects: projects.map(p => ({
        id: p.project.id,
        customProjectId: p.project.customProjectId,
        name: p.project.name,
        projectUrl: p.projectUrl || p.project.projectUrl,
        isActive: p.isActive,
      })),
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
  }

  generateProjectToken(user, project) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customRole: user.customRole,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyPhone: user.companyPhone,
      isActive: user.isActive,
      isSuspended: user.isSuspended || false,
      createdAt: user.createdAt,
      project: {
        id: project.id,
        customProjectId: project.customProjectId,
        name: project.name,
      },
      tokenType: 'PROJECT_ACCESS',
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
  }

  async generateRefreshToken(userId) {
    const token = uuidv4();
    const expiresAt = moment().add(
      process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    ).toDate();

    // Revoke existing refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    // Create new refresh token
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return refreshToken.token;
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.isRevoked || refreshToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    return refreshToken;
  }

  async revokeRefreshToken(token) {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId) {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async cleanupExpiredTokens() {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { isRevoked: true },
            { expiresAt: { lt: new Date() } },
          ],
        },
      });
      console.log(`Cleaned up ${result.count} expired/revoked refresh tokens`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization header found');
    }
    return authHeader.substring(7);
  }
}

export default new JWTService(); 