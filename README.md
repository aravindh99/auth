# Xtown Authenticator

https://vercel.com/aravinths-projects-4b7944a8/auth

A comprehensive authentication and authorization system with role-based access control, project management, and secure token-based authentication.

![Xtown Authenticator](https://img.shields.io/badge/Xtown-Authenticator-purple)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### 🔐 Authentication & Security
- **Multi-role Authentication**: Super Admin, Project Admin, and Sub-User roles
- **JWT Token System**: Secure access tokens with refresh token support
- **OTP Verification**: Email-based OTP for registration, activation, and password reset
- **Password Security**: bcrypt hashing with configurable rounds
- **Rate Limiting**: Protection against brute force attacks
- **Account Suspension**: Admin-controlled user suspension with reasons

### 👥 User Management
- **Hierarchical User System**: 
  - Super Admin: Full system control
  - Project Admin: Manage projects and sub-users
  - Sub-User: Access assigned projects only
- **Company Information**: Store and manage company details
- **User Statistics**: Comprehensive user analytics and reporting
- **Bulk Operations**: Efficient user management tools

### 📊 Project Management
- **Project Creation**: Super Admin can create and manage projects
- **Project Assignment**: Assign users to specific projects
- **Project URLs**: Custom URLs for each project with user-specific access
- **Project Statistics**: Track project usage and user access
- **Project Tokens**: Generate secure tokens for external project access

### 🎨 Modern UI/UX
- **Split-Screen Layout**: Professional authentication pages
- **Responsive Design**: Works seamlessly on all devices
- **Consistent Branding**: Unified Xtown Authenticator branding
- **Role-Based Dashboards**: Tailored interfaces for each user role
- **Real-time Updates**: Dynamic content updates without page refresh

### 📧 Email Integration
- **SMTP Support**: Configurable email service integration
- **Email Templates**: Professional email notifications
- **Welcome Emails**: Automated welcome messages for new users
- **OTP Delivery**: Secure OTP delivery via email
- **Account Notifications**: Important account status updates

### 📊 Dashboard Analytics & Charts
- **Role-Based Analytics**: Different charts for Super Admin and Project Admin
- **User Verification Charts**: Pie charts showing verified vs unverified users
- **System Overview Charts**: Bar charts displaying comprehensive system statistics
- **Real-time Data**: Live updates from database for accurate analytics
- **Interactive Visualizations**: Hover effects and tooltips for better user experience
- **Responsive Charts**: Optimized for all screen sizes and devices

#### Super Admin Dashboard Charts
- **User Verification Status**: Pie chart showing verified vs unverified users across the system
- **System Overview**: Bar chart displaying total users, projects, companies, admins, and sub-users
- **Company Statistics**: Overview of registered companies and their distribution

#### Project Admin Dashboard Charts
- **Sub User Verification Status**: Pie chart showing verified vs unverified sub-users created by the admin
- **Project Admin Overview**: Bar chart displaying sub-user count, assigned projects, verification status, and sub-user limit
- **Project Management**: Visual representation of project assignments and user limits

## 🏗️ Architecture

### Backend Stack
- **Node.js**: Server runtime environment
- **Express.js**: Web application framework
- **Prisma ORM**: Database toolkit and ORM
- **MySQL**: Primary database
- **JWT**: JSON Web Token authentication
- **Nodemailer**: Email service integration
- **bcrypt**: Password hashing
- **Rate Limiting**: API protection

### Frontend Stack
- **React 18**: User interface library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **CSS3**: Modern styling with gradients and animations
- **Local Storage**: Client-side token management

### Database Schema
- **Users**: User accounts and profiles
- **Projects**: Project definitions and settings
- **UserProjects**: Many-to-many user-project relationships
- **OTPRequests**: One-time password management
- **RefreshTokens**: Token refresh system
- **AuditLogs**: System activity tracking

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher) or **MariaDB** (v10.5 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
   ```bash
git clone https://github.com/aravindh99/auth.git
cd auth
   ```

### 2. Backend Setup
   ```bash
# Install dependencies
   npm install

# Copy environment file
cp .env.example .env

# Configure environment variables (see Backend Documentation)
nano .env

# Setup database
   npx prisma generate
   npx prisma migrate dev

# Start backend server
npm run dev
   ```

### 3. Frontend Setup
   ```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: MySQL on localhost:3306

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

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
```

### SMTP Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Update the `.env` file with your credentials

## 📖 Documentation

- **[Frontend API Documentation](frontend/API_DOCUMENTATION.md)** - Complete API reference for frontend integration
- **[Backend Documentation](BACKEND_DOCUMENTATION.md)** - Backend setup, configuration, and technical details

## 🔧 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run build        # Build for production
npm run test         # Run tests
npm run migrate      # Run database migrations
npm run studio       # Open Prisma Studio
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🏛️ User Roles & Permissions

### Super Admin
- ✅ Create and manage all projects
- ✅ Create Project Admins and Sub-Users
- ✅ View system-wide statistics
- ✅ Manage all user accounts
- ✅ Access all projects
- ✅ System configuration

### Project Admin
- ✅ Manage assigned projects
- ✅ Create and manage Sub-Users
- ✅ View project-specific statistics
- ✅ Suspend/unsuspend Sub-Users
- ✅ Access assigned projects only

### Sub-User
- ✅ Access assigned projects
- ✅ View project information
- ✅ Limited dashboard view
- ❌ No user management
- ❌ No project creation

## 🔐 Security Features

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh system
- **Password Hashing**: bcrypt with 12 rounds
- **OTP Verification**: Email-based verification
- **Rate Limiting**: Protection against attacks

### Data Protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Prisma ORM safeguards
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Cross-origin security
- **HTTPS Ready**: Production-ready security

### Access Control
- **Role-Based Access**: Granular permission system
- **Project Isolation**: Users only access assigned projects
- **Token Revocation**: Automatic token cleanup
- **Session Management**: Secure session handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Super Admin registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/users` - Get all users
- `POST /api/users/project-admin` - Create Project Admin
- `POST /api/users/sub-user` - Create Sub User
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Project Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment
NODE_ENV=production

# Configure production database
DATABASE_URL="mysql://prod_user:prod_password@prod_host:3306/xtown_auth_prod"

# Set strong JWT secret
JWT_SECRET="your-production-jwt-secret-256-bits-minimum"
```

2. **Database Migration**
```bash
npx prisma migrate deploy
npx prisma generate
```

3. **Build and Deploy**
   ```bash
# Backend
npm ci --only=production
   npm run build

# Frontend
cd frontend
npm ci --only=production
npm run build
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t xtown-auth-backend .
docker build -t xtown-auth-frontend ./frontend
```

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Authentication"

# Run with coverage
npm run test:coverage
```

### Frontend Testing
   ```bash
cd frontend
npm test
npm run test:coverage
```

## 📈 Monitoring & Maintenance

### Health Checks
- Database connectivity monitoring
- SMTP service availability
- API response time tracking
- Error rate monitoring

### Regular Maintenance
- Database cleanup (expired tokens)
- Log rotation
- Security updates
- Performance optimization

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📖 **Documentation**: Check the detailed documentation files
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Email**: Contact support@xtown.com

### Common Issues
- **Database Connection**: Ensure MySQL is running and credentials are correct
- **SMTP Issues**: Verify email credentials and 2FA settings
- **CORS Errors**: Check ALLOWED_ORIGINS configuration
- **Token Issues**: Verify JWT_SECRET is set correctly

## 🏆 Acknowledgments

- **Prisma Team** for the excellent ORM
- **Express.js Community** for the robust framework
- **React Team** for the amazing frontend library
- **MySQL Community** for the reliable database

## 📊 Project Statistics

- **Lines of Code**: ~15,000
- **API Endpoints**: 25+
- **Database Tables**: 6
- **User Roles**: 3
- **Security Features**: 10+

---

**Built with ❤️ by the Aravindh**

For more information, visit [aravindh](https://github.com/aravindh99) 
