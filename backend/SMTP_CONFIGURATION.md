# SMTP Configuration Guide

## 📧 **Email Service Setup for Authentication System**

The authentication system supports multiple SMTP providers for sending OTP and welcome emails. Choose the method that best suits your needs.

---

## **🚀 Quick Setup (Gmail - Recommended for Development)**

### **Step 1: Enable Gmail App Passwords**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate password for "Mail"
5. Copy the 16-character password

### **Step 2: Environment Variables**
```env
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="abcd efgh ijkl mnop"  # 16-character app password
EMAIL_FROM="your-email@gmail.com"
```

---

## **📧 Supported SMTP Providers**

### **1. Gmail**
```env
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
EMAIL_FROM="your-email@gmail.com"
```

**Setup Requirements:**
- Enable 2-Factor Authentication
- Generate App Password (not your regular password)

---

### **2. Outlook/Hotmail**
```env
EMAIL_SERVICE="hotmail"
EMAIL_USER="your-email@outlook.com"
EMAIL_PASSWORD="your-password"
EMAIL_FROM="your-email@outlook.com"
```

**Setup Requirements:**
- Use your regular Outlook password
- May require app-specific password for enhanced security

---

### **3. Yahoo Mail**
```env
EMAIL_SERVICE="yahoo"
EMAIL_USER="your-email@yahoo.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="your-email@yahoo.com"
```

**Setup Requirements:**
- Enable 2-Factor Authentication
- Generate App Password in Account Security settings

---

### **4. Custom SMTP Server**
```env
EMAIL_SERVICE="custom"
SMTP_HOST="smtp.your-domain.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_REJECT_UNAUTHORIZED="true"
EMAIL_USER="your-email@your-domain.com"
EMAIL_PASSWORD="your-password"
EMAIL_FROM="noreply@your-domain.com"
```

**Configuration Options:**
- `SMTP_PORT`: Usually 587 (TLS) or 465 (SSL)
- `SMTP_SECURE`: "true" for port 465, "false" for others
- `SMTP_REJECT_UNAUTHORIZED`: "false" for self-signed certificates

---

## **🏢 Business Email Providers**

### **SendGrid**
```env
EMAIL_SERVICE="custom"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
EMAIL_USER="apikey"
EMAIL_PASSWORD="SG.your-sendgrid-api-key"
EMAIL_FROM="noreply@your-domain.com"
```

### **Mailgun**
```env
EMAIL_SERVICE="custom"
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
EMAIL_USER="your-mailgun-smtp-username"
EMAIL_PASSWORD="your-mailgun-smtp-password"
EMAIL_FROM="noreply@your-domain.com"
```

### **Amazon SES**
```env
EMAIL_SERVICE="custom"
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
EMAIL_USER="your-ses-smtp-username"
EMAIL_PASSWORD="your-ses-smtp-password"
EMAIL_FROM="noreply@your-domain.com"
```

### **Zoho Mail**
```env
EMAIL_SERVICE="custom"
SMTP_HOST="smtp.zoho.com"
SMTP_PORT="587"
SMTP_SECURE="false"
EMAIL_USER="your-email@your-domain.com"
EMAIL_PASSWORD="your-password"
EMAIL_FROM="your-email@your-domain.com"
```

---

## **🔧 Complete .env Configuration**

Create a `.env` file in your project root with these variables:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/auth_system"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_EXPIRES_IN="8h"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-min-32-characters"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Email Configuration (Choose one method above)
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Server Configuration
PORT=5000
NODE_ENV="development"

# OTP Configuration
OTP_EXPIRES_IN_MINUTES=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

---

## **🧪 Testing Email Configuration**

### **Test Email Sending**
Create a simple test script to verify your configuration:

```javascript
// test-email.js
import emailService from './src/utils/emailService.js';

async function testEmail() {
  try {
    const result = await emailService.sendOTP('test@example.com', '123456', 'REGISTRATION');
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();
```

Run the test:
```bash
node test-email.js
```

---

## **🔍 Troubleshooting**

### **Common Issues:**

1. **"Invalid login" error with Gmail:**
   - Make sure 2FA is enabled
   - Use App Password, not regular password
   - App Password should be 16 characters without spaces

2. **"Connection timeout" error:**
   - Check SMTP host and port
   - Verify firewall settings
   - Try different port (587, 465, 25)

3. **"Self signed certificate" error:**
   - Set `SMTP_REJECT_UNAUTHORIZED="false"`
   - Or update to use proper SSL certificate

4. **Rate limiting issues:**
   - Most providers have sending limits
   - Gmail: 100 emails/day for personal accounts
   - Consider business email providers for production

### **Debug Mode:**
Add this to your email service for debugging:

```javascript
// Add to emailService.js constructor
this.transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});
```

---

## **📋 Quick Checklist**

✅ **Environment variables set correctly**  
✅ **SMTP credentials are valid**  
✅ **2FA and App Passwords configured (if required)**  
✅ **Firewall allows SMTP connections**  
✅ **Email service test passes**  
✅ **OTP emails are being received**  

---

## **🚀 Production Recommendations**

1. **Use business email providers** (SendGrid, Mailgun, SES)
2. **Set up proper domain authentication** (SPF, DKIM, DMARC)
3. **Monitor email delivery rates**
4. **Implement email templates**
5. **Set up email logging and analytics**

Your email service is now ready to send OTP and welcome emails! 🎉 