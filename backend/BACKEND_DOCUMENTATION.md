# Backend Documentation - Xtown Authenticator

## Overview
This document provides comprehensive backend documentation for the Xtown Authenticator system, including setup, configuration, and technical implementation details.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [SMTP Configuration](#smtp-configuration)
5. [Authentication System](#authentication-system)
6. [API Architecture](#api-architecture)
7. [Security Features](#security-features)
8. [Deployment Guide](#deployment-guide)

## Project Structure

```
src/
├── controllers/          # Business logic controllers
│   ├── authController.js
│   ├── projectController.js
│   └── userManagementController.js
├── middleware/           # Express middleware
│   ├── auth.js
│   └── rateLimiter.js
├── routes/              # API route definitions
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── userManagementRoutes.js
├── utils/               # Utility services
│   ├── emailService.js
│   ├── jwtService.js
│   ├── otpService.js
│   └── validators.js
├── app.js              # Express app configuration
└── server.js           # Server entry point

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations

.env                   # Environment variables
package.json           # Dependencies and scripts
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/xtown_auth"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="8h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Xtown Authenticator <your-email@gmail.com>"

# OTP Configuration
OTP_EXPIRES_IN="10m"
OTP_LENGTH=6

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Security
BCRYPT_ROUNDS=12
```

## Database Setup

### Prerequisites
- MySQL 8.0+ or MariaDB 10.5+
- Node.js 18+

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

3. **Database Schema Overview**

```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'SUB_USER') NOT NULL,
  customRole VARCHAR(100),
  companyName VARCHAR(255),
  companyAddress TEXT,
  companyPhone VARCHAR(20),
  isActive BOOLEAN DEFAULT true,
  isSuspended BOOLEAN DEFAULT false,
  suspendedAt DATETIME,
  suspensionReason VARCHAR(500),
  suspendedBy INT,
  unsuspendedAt DATETIME,
  unsuspendedBy INT,
  subUserLimit INT DEFAULT 5,
  createdById INT,
  lastLoginAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customProjectId VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  projectUrl VARCHAR(500) NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User-Project relationships
CREATE TABLE user_projects (
  userId INT NOT NULL,
  projectId INT NOT NULL,
  assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  lastAccessed DATETIME,
  PRIMARY KEY (userId, projectId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

-- OTP requests
CREATE TABLE otp_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  purpose ENUM('REGISTRATION', 'FORGOT_PASSWORD', 'ACCOUNT_ACTIVATION') NOT NULL,
  expiresAt DATETIME NOT NULL,
  isUsed BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  isRevoked BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit logs
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(50),
  projectId INT,
  details JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  success BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

## SMTP Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update .env file**:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
SMTP_FROM="Xtown Authenticator <your-email@gmail.com>"
```

### Other SMTP Providers

#### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT=587
SMTP_SECURE=false
```

#### Custom SMTP Server
```env
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-username"
SMTP_PASS="your-password"
```

### Email Templates

The system sends the following email types:

1. **Registration OTP**
2. **Account Activation OTP**
3. **Forgot Password OTP**
4. **Welcome Email**
5. **Account Suspension Notification**

## Authentication System

### JWT Token Structure

#### Access Token Payload
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ADMIN",
  "customRole": "Developer",
  "companyName": "Acme Corp",
  "companyAddress": "123 Business St, City, Country",
  "companyPhone": "+1234567890",
  "isActive": true,
  "isSuspended": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "projects": [
    {
      "id": 1,
      "customProjectId": "my-project",
      "name": "My Project",
      "projectUrl": "https://myproject.com",
      "isActive": true
    }
  ],
  "iat": 1704067200,
  "exp": 1704096000
}
```

#### Project Token Payload
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ADMIN",
  "customRole": "Developer",
  "companyName": "Acme Corp",
  "companyAddress": "123 Business St, City, Country",
  "companyPhone": "+1234567890",
  "isActive": true,
  "isSuspended": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "project": {
    "id": 1,
    "customProjectId": "my-project",
    "name": "My Project"
  },
  "tokenType": "PROJECT_ACCESS",
  "iat": 1704067200,
  "exp": 1704096000
}
```

### Refresh Token System

- **Format**: UUID v4
- **Storage**: Database with user association
- **Expiration**: 7 days (configurable)
- **Security**: Automatically revoked on logout/password reset
- **Cleanup**: Expired tokens automatically removed

### OTP System

- **Length**: 6 digits
- **Expiration**: 10 minutes
- **Rate Limiting**: 1 request per 60 seconds
- **Purposes**: Registration, Account Activation, Forgot Password

## API Architecture

### Route Structure

```
/api
├── /auth
│   ├── POST /register                    # Super Admin registration
│   ├── POST /verify-registration-otp     # Verify registration OTP
│   ├── POST /login                       # User login
│   ├── POST /activate-account            # Account activation
│   ├── POST /forgot-password             # Send reset OTP
│   ├── POST /reset-password              # Reset password
│   ├── POST /refresh-token               # Refresh access token
│   ├── POST /logout                      # User logout
│   ├── POST /validate-token              # Validate token
│   ├── POST /project-token/:projectId    # Generate project token
│   └── GET /check-super-admin            # Check if Super Admin exists
├── /projects
│   ├── GET /                             # Get all projects
│   ├── GET /:id                          # Get project by ID
│   ├── POST /                            # Create project (Super Admin)
│   ├── PUT /:id                          # Update project (Super Admin)
│   ├── DELETE /:id                       # Delete project (Super Admin)
│   └── GET /stats                        # Project statistics
└── /users
    ├── GET /                             # Get all users
    ├── GET /:id                          # Get user by ID
    ├── POST /project-admin               # Create Project Admin
    ├── POST /sub-user                    # Create Sub User
    ├── PUT /:id                          # Update user
    ├── PUT /:id/projects                 # Update user projects
    ├── POST /:id/suspend                 # Suspend user
    ├── POST /:id/unsuspend               # Unsuspend user
    ├── DELETE /:id                       # Delete user
    └── GET /stats                        # User statistics
```

### Middleware Stack

1. **CORS** - Cross-origin resource sharing
2. **Rate Limiting** - API request throttling
3. **Authentication** - JWT token verification
4. **Authorization** - Role-based access control
5. **Validation** - Request data validation
6. **Error Handling** - Global error management

## Security Features

### Password Security
- **Hashing**: bcrypt with 12 rounds
- **Validation**: Minimum 8 characters, alphanumeric
- **Reset**: Secure OTP-based password reset

### Token Security
- **Access Token**: 8-hour expiration
- **Refresh Token**: 7-day expiration with database storage
- **Project Token**: 8-hour expiration for external access
- **Automatic Revocation**: On logout and password reset

### Rate Limiting
- **OTP Requests**: 1 per 60 seconds
- **Login Attempts**: 5 per 15 minutes
- **General API**: 100 requests per 15 minutes

### Data Protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection**: Prisma ORM protection
- **XSS Protection**: Input sanitization
- **CORS**: Configurable origin restrictions

## Deployment Guide

### Production Environment Variables

```env
# Production Configuration
NODE_ENV=production
PORT=5000

# Database (Use production database)
DATABASE_URL="mysql://prod_user:prod_password@prod_host:3306/xtown_auth_prod"

# JWT (Use strong, unique secret)
JWT_SECRET="your-production-jwt-secret-256-bits-minimum"
JWT_EXPIRES_IN="8h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# SMTP (Production email service)
SMTP_HOST="smtp.provider.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-smtp-password"
SMTP_FROM="Xtown Authenticator <noreply@yourdomain.com>"

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (Production domains)
ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
```

### Deployment Steps

1. **Database Migration**
```bash
# Generate production migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

2. **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Update with production values
nano .env
```

3. **Install Dependencies**
```bash
npm ci --only=production
```

4. **Start Application**
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start src/server.js --name "xtown-auth"

# Or using Node directly
node src/server.js
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Monitoring and Logging

1. **Application Logs**
```bash
# PM2 logs
pm2 logs xtown-auth

# File logging
npm install winston
```

2. **Database Monitoring**
```bash
# Prisma Studio (development only)
npx prisma studio

# Database health check
npx prisma db execute --stdin
```

3. **Performance Monitoring**
```bash
# Install monitoring tools
npm install express-rate-limit helmet compression
```

## Troubleshooting

### Common Issues

1. **Database Connection**
```bash
# Test database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

2. **SMTP Issues**
```bash
# Test email configuration
node -e "
const emailService = require('./src/utils/emailService.js');
emailService.sendTestEmail('test@example.com');
"
```

3. **JWT Issues**
```bash
# Verify JWT secret
node -e "
const jwt = require('jsonwebtoken');
console.log(jwt.sign({test: 'data'}, process.env.JWT_SECRET));
"
```

### Performance Optimization

1. **Database Indexing**
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(userId);
CREATE INDEX idx_otp_requests_email ON otp_requests(email);
```

2. **Caching Strategy**
```javascript
// Implement Redis for session caching
const redis = require('redis');
const client = redis.createClient();
```

3. **Connection Pooling**
```javascript
// Configure Prisma connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});
```

## API Testing

### Using Postman/Insomnia

1. **Import Collection**
```json
{
  "info": {
    "name": "Xtown Authenticator API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

2. **Environment Variables**
```json
{
  "baseUrl": "http://localhost:5000/api",
  "accessToken": "",
  "refreshToken": ""
}
```

### Automated Testing

```javascript
// test/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  test('should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Dashboard Analytics & Chart Data Support

### Overview
The backend provides comprehensive data endpoints to support the dashboard analytics and interactive charts. The system delivers role-based data that powers the frontend chart components.

### Chart Data Endpoints

#### 1. User Statistics for Charts
```http
GET /api/users/stats
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "projectAdmins": 20,
    "subUsers": 80,
    "verifiedUsers": 85,
    "unverifiedUsers": 15,
    "recentUsers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ADMIN",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 2. Project Statistics for Charts
```http
GET /api/projects/stats
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 50,
    "activeProjects": 45,
    "inactiveProjects": 5,
    "projectsByUser": {
      "user_123": 10,
      "user_124": 5
    }
  }
}
```

### Role-Based Data Filtering

#### Super Admin Data
- **User Statistics**: All users across the system
- **Project Statistics**: All projects and their status
- **Company Statistics**: All registered companies
- **System Overview**: Complete system metrics

#### Project Admin Data
- **User Statistics**: Only sub-users created by the admin
- **Project Statistics**: Only projects assigned to the admin
- **Personal Overview**: Admin-specific metrics and limits

### Data Processing for Charts

#### User Verification Chart Data
```javascript
// Backend processing for pie chart
const getUserVerificationData = async (userId, role) => {
  if (role === 'SUPER_ADMIN') {
    // Get all users
    const users = await prisma.user.findMany({
      where: { role: { not: 'SUPER_ADMIN' } }
    });
    
    return {
      verifiedUsers: users.filter(u => u.isActive).length,
      unverifiedUsers: users.filter(u => !u.isActive).length
    };
  } else if (role === 'ADMIN') {
    // Get only sub-users created by this admin
    const subUsers = await prisma.user.findMany({
      where: { 
        createdById: userId,
        role: 'SUB_USER'
      }
    });
    
    return {
      verifiedUsers: subUsers.filter(u => u.isActive).length,
      unverifiedUsers: subUsers.filter(u => !u.isActive).length
    };
  }
};
```

#### System Overview Chart Data
```javascript
// Backend processing for bar chart
const getSystemOverviewData = async (userId, role) => {
  if (role === 'SUPER_ADMIN') {
    const [users, projects, companies] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
      prisma.project.count({ where: { isActive: true } }),
      prisma.user.count({ 
        where: { 
          role: 'ADMIN',
          companyName: { not: null }
        },
        distinct: ['companyName']
      })
    ]);
    
    return [
      { name: 'Users', value: users, color: '#3B82F6' },
      { name: 'Projects', value: projects, color: '#10B981' },
      { name: 'Companies', value: companies, color: '#F59E0B' }
    ];
  } else if (role === 'ADMIN') {
    const [subUsers, assignedProjects] = await Promise.all([
      prisma.user.count({
        where: { 
          createdById: userId,
          role: 'SUB_USER'
        }
      }),
      prisma.userProject.count({
        where: { userId, isActive: true }
      })
    ]);
    
    return [
      { name: 'Sub Users', value: subUsers, color: '#EF4444' },
      { name: 'Assigned Projects', value: assignedProjects, color: '#10B981' }
    ];
  }
};
```

### Performance Optimization for Charts

#### Database Queries
```javascript
// Optimized queries for chart data
const getOptimizedChartData = async () => {
  // Use aggregation queries for better performance
  const userStats = await prisma.user.groupBy({
    by: ['isActive'],
    where: { role: { not: 'SUPER_ADMIN' } },
    _count: { id: true }
  });
  
  const projectStats = await prisma.project.groupBy({
    by: ['isActive'],
    _count: { id: true }
  });
  
  return { userStats, projectStats };
};
```

#### Caching Strategy
```javascript
// Cache chart data for better performance
const cacheChartData = async (key, data, ttl = 300) => {
  await redis.setex(key, ttl, JSON.stringify(data));
};

const getCachedChartData = async (key) => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

### Real-time Data Updates

#### WebSocket Support (Optional)
```javascript
// Real-time chart updates
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('subscribe-charts', (userId) => {
    socket.join(`charts-${userId}`);
  });
});

// Emit chart updates
const emitChartUpdate = (userId, data) => {
  io.to(`charts-${userId}`).emit('chart-update', data);
};
```

#### Polling Strategy
```javascript
// Frontend polling for chart updates
const pollChartData = async () => {
  const response = await fetch('/api/users/stats');
  const data = await response.json();
  
  // Update charts with new data
  updateCharts(data);
  
  // Schedule next poll
  setTimeout(pollChartData, 30000); // Poll every 30 seconds
};
```

### Chart Data Security

#### Access Control
```javascript
// Ensure users only see their authorized data
const getAuthorizedChartData = async (req, res) => {
  const { role, id } = req.user;
  
  if (role === 'SUPER_ADMIN') {
    // Super admin can see all data
    return getAllChartData();
  } else if (role === 'ADMIN') {
    // Project admin can only see their sub-users
    return getAdminChartData(id);
  } else {
    // Sub users cannot access chart data
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};
```

#### Data Validation
```javascript
// Validate chart data before sending
const validateChartData = (data) => {
  const required = ['totalUsers', 'verifiedUsers', 'unverifiedUsers'];
  
  for (const field of required) {
    if (typeof data[field] !== 'number' || data[field] < 0) {
      throw new Error(`Invalid ${field} value`);
    }
  }
  
  return data;
};
```

### Monitoring Chart Performance

#### Metrics to Track
- Chart data response time
- Database query performance
- Cache hit/miss ratios
- Memory usage for large datasets

#### Logging
```javascript
// Log chart data requests
const logChartRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Chart data request: ${req.path} - ${duration}ms`);
  });
  
  next();
};
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Database Cleanup**
```bash
# Clean expired tokens (run daily)
npx prisma db execute --stdin <<< "
DELETE FROM refresh_tokens 
WHERE expiresAt < NOW() OR isRevoked = true;
"
```

2. **Log Rotation**
```bash
# Rotate application logs
logrotate /etc/logrotate.d/xtown-auth
```

3. **Backup Strategy**
```bash
# Database backup
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### Monitoring Alerts

1. **Application Health**
- Response time > 2 seconds
- Error rate > 5%
- Memory usage > 80%

2. **Database Health**
- Connection pool exhaustion
- Slow queries > 1 second
- Disk space < 20%

3. **Email Service**
- SMTP connection failures
- Email delivery rate < 95%
- Queue backlog > 100 emails

### Security Updates

1. **Dependency Updates**
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

2. **JWT Secret Rotation**
```bash
# Generate new secret
openssl rand -hex 32

# Update environment and restart
pm2 restart xtown-auth
```

3. **SSL Certificate Renewal**
```bash
# Renew certificates
certbot renew

# Restart application
pm2 restart xtown-auth
``` 