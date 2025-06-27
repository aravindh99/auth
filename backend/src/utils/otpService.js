import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import moment from 'moment';

const prisma = new PrismaClient();

class OTPService {
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async createOTP(email, purpose) {
    const otp = this.generateOTP();
    const expiresAt = moment().add(process.env.OTP_EXPIRES_IN_MINUTES || 10, 'minutes').toDate();

    // Delete any existing unused OTPs for this email and purpose
    await prisma.otpRequest.deleteMany({
      where: {
        email,
        purpose,
        isUsed: false,
      },
    });

    // Create new OTP
    const otpRequest = await prisma.otpRequest.create({
      data: {
        email,
        otp,
        purpose,
        expiresAt,
        isUsed: false,
      },
    });

    return { otpId: otpRequest.id, otp };
  }

  async verifyOTP(email, otp, purpose) {
    const otpRequest = await prisma.otpRequest.findFirst({
      where: {
        email,
        otp,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRequest) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as used
    await prisma.otpRequest.update({
      where: { id: otpRequest.id },
      data: { isUsed: true },
    });

    return { valid: true, message: 'OTP verified successfully' };
  }

  async cleanupExpiredOTPs() {
    try {
      const result = await prisma.otpRequest.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      console.log(`Cleaned up ${result.count} expired OTPs`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return 0;
    }
  }

  async hasRecentOTP(email, purpose, minutes = 1) {
    const recentTime = moment().subtract(minutes, 'minutes').toDate();
    
    const recentOTP = await prisma.otpRequest.findFirst({
      where: {
        email,
        purpose,
        createdAt: {
          gte: recentTime,
        },
      },
    });

    return !!recentOTP;
  }
}

export default new OTPService(); 