import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    
    
    // Check if using predefined service or custom SMTP
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_SERVICE !== 'custom') {
      // Use explicit SMTP settings for better connectivity
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // Use STARTTLS
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
      } else {
        // Use predefined service for other providers
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        console.log(`📧 Using ${process.env.EMAIL_SERVICE} service`);
      }
    } else {
      // Use custom SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        }
      });
      console.log('📧 Using custom SMTP configuration');
    }
    
    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP Configuration Error:', error);
      } else {
        console.log('✅ SMTP Server is ready to send emails');
      }
    });
  }

  async sendOTP(email, otp, purpose) {
    console.log(`📧 Sending OTP to ${email} for ${purpose}`);
    
    const subject = purpose === 'REGISTRATION' 
      ? 'Verify Your Email - Registration OTP'
      : purpose === 'FORGOT_PASSWORD'
      ? 'Reset Your Password - OTP'
      : 'Reset Your Password - OTP';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Authentication System</h2>
        <p>Hi there,</p>
        <p>Your OTP for ${purpose === 'REGISTRATION' ? 'email verification' : 'password reset'} is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in ${process.env.OTP_EXPIRES_IN_MINUTES || 10} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Xtown</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    console.log('📮 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, name, role) {
    const subject = 'Xtown';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xtown</h2>
        <p>Hi ${name},</p>
        <p>Your account has been successfully created with the role: <strong>${role}</strong></p>
        <p>You can now log in to access your dashboard and assigned projects.</p>
        <p>Best regards,<br>Xtown</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAccountActivationOTP(email, name, otp, role) {
    const subject = 'Account Activation Required - OTP Verification';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Account Activation Required</h2>
        <p>Hi ${name},</p>
        <p>Your account has been created with the role: <strong>${role}</strong></p>
        <p>To activate your account and start using the system, please verify your email address with the OTP below:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in ${process.env.OTP_EXPIRES_IN_MINUTES || 10} minutes.</p>
        <p><strong>Important:</strong> You will not be able to log in until your email is verified.</p>
        <p>If you didn't expect this email, please contact your administrator.</p>
        <p>Best regards,<br>Xtown Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Account activation email sending failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService(); 