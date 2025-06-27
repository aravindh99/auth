# Frontend API Documentation

## Overview
This document provides comprehensive API documentation for the Xtown Authenticator frontend integration.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API requests (except auth endpoints) require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Token Information

### Access Token Payload Structure
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

### Refresh Token
- Format: UUID v4
- Expires: 7 days (configurable)
- Stored in database with user association
- Automatically revoked on logout or password reset

## API Endpoints

### Authentication Endpoints

#### 1. Check Super Admin Exists
```http
GET /auth/check-super-admin
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exists": false
  }
}
```

#### 2. Register Super Admin (Step 1 - Send OTP)
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "companyName": "Xtown Corp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration."
}
```

#### 3. Verify Super Admin OTP (Step 2 - Complete Registration)
```http
POST /auth/verify-registration-otp
```

**Request Body:**
```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "companyName": "Xtown Corp",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Super Admin registered successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@example.com",
      "role": "SUPER_ADMIN",
      "companyName": "Xtown Corp"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### 4. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "ADMIN",
      "companyName": "Acme Corp",
      "projects": [
        {
          "id": 1,
          "customProjectId": "my-project",
          "name": "My Project",
          "icon": "🚀",
          "description": "A sample project",
          "projectUrl": "https://myproject.com"
        }
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### 5. Activate Account
```http
POST /auth/activate-account
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account activated successfully. You can now log in."
}
```

#### 6. Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reset code sent to your email. Please check your inbox."
}
```

#### 7. Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

#### 8. Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 9. Logout
```http
POST /auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

#### 10. Validate Token
```http
POST /auth/validate-token
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid.",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "ADMIN",
      "project": null
    }
  }
}
```

#### 11. Generate Project Token
```http
POST /auth/project-token/:customProjectId
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project token generated successfully.",
  "data": {
    "projectToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "redirectUrl": "https://myproject.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Project Endpoints

#### 1. Get All Projects
```http
GET /projects
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "customProjectId": "my-project",
        "name": "My Project",
        "icon": "🚀",
        "description": "A sample project",
        "projectUrl": "https://myproject.com",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 2. Get Project by ID
```http
GET /projects/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "customProjectId": "my-project",
      "name": "My Project",
      "icon": "🚀",
      "description": "A sample project",
      "projectUrl": "https://myproject.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 3. Create Project (Super Admin Only)
```http
POST /projects
```

**Request Body:**
```json
{
  "customProjectId": "my-project",
  "name": "My Project",
  "description": "A sample project",
  "projectUrl": "https://myproject.com",
  "icon": "🚀"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "project": {
      "id": 1,
      "customProjectId": "my-project",
      "name": "My Project",
      "icon": "🚀",
      "description": "A sample project",
      "projectUrl": "https://myproject.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4. Update Project (Super Admin Only)
```http
PUT /projects/:customProjectId
```

**Request Body:**
```json
{
  "projectUrl": "https://updated-project.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully."
}
```

#### 5. Delete Project (Super Admin Only)
```http
DELETE /projects/:customProjectId
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully."
}
```

#### 6. Get Project Statistics (Super Admin Only)
```http
GET /projects/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 5,
    "activeProjects": 4,
    "inactiveProjects": 1
  }
}
```

### User Management Endpoints

#### 1. Get All Users
```http
GET /users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ADMIN",
        "customRole": null,
        "companyName": "Acme Corp",
        "companyAddress": "123 Business St",
        "companyPhone": "+1234567890",
        "isActive": true,
        "isSuspended": false,
        "suspendedAt": null,
        "suspensionReason": null,
        "subUserLimit": 5,
        "status": "Active",
        "lastLoginAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "createdBy": {
          "id": 1,
          "name": "Super Admin",
          "email": "admin@example.com"
        },
        "projects": [
          {
            "id": 1,
            "customProjectId": "my-project",
            "name": "My Project",
            "projectUrl": "https://myproject.com"
          }
        ]
      }
    ]
  }
}
```

#### 2. Create Project Admin (Super Admin Only)
```http
POST /users/project-admin
```

**Request Body:**
```json
{
  "name": "Project Admin",
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "companyName": "Acme Corp",
  "companyAddress": "123 Business St, City, Country",
  "companyPhone": "+1234567890",
  "subUserLimit": 10,
  "projectAssignments": [
    {
      "projectId": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project Admin created successfully. Verification email sent. User must verify email before logging in.",
  "data": {
    "user": {
      "id": 2,
      "name": "Project Admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "companyName": "Acme Corp",
      "companyAddress": "123 Business St, City, Country",
      "companyPhone": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": false
    },
    "assignedProjects": [
      {
        "id": 1,
        "customProjectId": "my-project",
        "name": "My Project",
        "projectUrl": "https://myproject.com"
      }
    ]
  }
}
```

#### 3. Create Sub User (Project Admin Only)
```http
POST /users/sub-user
```

**Request Body:**
```json
{
  "name": "Sub User",
  "email": "subuser@example.com",
  "password": "SecurePassword123",
  "role": "Developer",
  "projectAssignments": [
    {
      "projectId": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sub User created successfully. Verification email sent. User must verify email before logging in.",
  "data": {
    "user": {
      "id": 3,
      "name": "Sub User",
      "email": "subuser@example.com",
      "role": "SUB_USER",
      "customRole": "Developer",
      "companyName": "Acme Corp",
      "companyAddress": "123 Business St, City, Country",
      "companyPhone": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": false
    },
    "assignedProjects": [
      {
        "id": 1,
        "customProjectId": "my-project",
        "name": "My Project",
        "projectUrl": "https://myproject.com"
      }
    ]
  }
}
```

#### 4. Update User Project Assignments (Super Admin Only)
```http
PUT /users/:userId/projects
```

**Request Body:**
```json
{
  "projectAssignments": [
    {
      "projectId": 1
    },
    {
      "projectId": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User project assignments updated successfully.",
  "data": {
    "assignedProjects": [
      {
        "id": 1,
        "customProjectId": "my-project",
        "name": "My Project",
        "projectUrl": "https://myproject.com"
      },
      {
        "id": 2,
        "customProjectId": "another-project",
        "name": "Another Project",
        "projectUrl": "https://anotherproject.com"
      }
    ]
  }
}
```

#### 5. Suspend User
```http
POST /users/:userId/suspend
```

**Request Body:**
```json
{
  "reason": "Violation of terms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully.",
  "data": {
    "user": {
      "id": 3,
      "name": "Sub User",
      "email": "subuser@example.com",
      "role": "SUB_USER",
      "isSuspended": true,
      "suspendedAt": "2024-01-01T00:00:00.000Z",
      "suspensionReason": "Violation of terms"
    }
  }
}
```

#### 6. Unsuspend User
```http
POST /users/:userId/unsuspend
```

**Response:**
```json
{
  "success": true,
  "message": "User unsuspended successfully.",
  "data": {
    "user": {
      "id": 3,
      "name": "Sub User",
      "email": "subuser@example.com",
      "role": "SUB_USER",
      "isSuspended": false,
      "unsuspendedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 7. Delete User
```http
DELETE /users/:userId
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully.",
  "data": {
    "deletedUsersCount": 1,
    "subUsersDeleted": 0
  }
}
```

#### 8. Get User Statistics (Super Admin Only)
```http
GET /users/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "projectAdmins": 3,
    "subUsers": 7,
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

## Dashboard Analytics & Charts

### Overview
The dashboard provides role-based analytics with interactive charts powered by Recharts library. Different charts are displayed based on user roles and permissions.

### Chart Components

#### UserStatsPieChart
Displays user verification status in a pie chart format.

**Props:**
```javascript
{
  verifiedUsers: number,    // Number of verified users
  unverifiedUsers: number,  // Number of unverified users
  title: string            // Chart title (optional)
}
```

**Features:**
- Interactive tooltips showing user counts and percentages
- Custom legend with color-coded indicators
- Responsive design for all screen sizes
- Hover effects for better user experience

#### TotalCountsBarChart
Displays system statistics in a bar chart format.

**Props:**
```javascript
{
  data: Array<{
    name: string,    // Category name
    value: number,   // Count value
    color: string    // Bar color
  }>,
  title: string     // Chart title (optional)
}
```

**Features:**
- Custom bar styling with rounded corners
- Interactive tooltips with detailed information
- Grid lines for better readability
- Responsive layout with mobile optimization

### Role-Based Chart Data

#### Super Admin Dashboard
- **User Verification Status**: Shows verified vs unverified users across the entire system
- **System Overview**: Displays total users, projects, companies, admins, and sub-users

**Sample Data Structure:**
```javascript
// User Verification Chart
{
  verifiedUsers: 45,
  unverifiedUsers: 12
}

// System Overview Chart
[
  { name: 'Users', value: 57, color: '#3B82F6' },
  { name: 'Projects', value: 8, color: '#10B981' },
  { name: 'Companies', value: 5, color: '#F59E0B' },
  { name: 'Admins', value: 12, color: '#8B5CF6' },
  { name: 'Sub Users', value: 45, color: '#EF4444' }
]
```

#### Project Admin Dashboard
- **Sub User Verification Status**: Shows verified vs unverified sub-users created by the admin
- **Project Admin Overview**: Displays sub-user count, assigned projects, verification status, and sub-user limit

**Sample Data Structure:**
```javascript
// Sub User Verification Chart
{
  verifiedUsers: 8,
  unverifiedUsers: 2
}

// Project Admin Overview Chart
[
  { name: 'Sub Users', value: 10, color: '#EF4444' },
  { name: 'Assigned Projects', value: 3, color: '#10B981' },
  { name: 'Verified Sub Users', value: 8, color: '#10B981' },
  { name: 'Unverified Sub Users', value: 2, color: '#F59E0B' },
  { name: 'Sub User Limit', value: 15, color: '#8B5CF6' }
]
```

### Chart Integration

#### Installation
```bash
npm install recharts
```

#### Usage in Components
```javascript
import UserStatsPieChart from '../components/charts/UserStatsPieChart';
import TotalCountsBarChart from '../components/charts/TotalCountsBarChart';

// In your dashboard component
<UserStatsPieChart 
  verifiedUsers={verifiedCount}
  unverifiedUsers={unverifiedCount}
  title="User Verification Status"
/>

<TotalCountsBarChart 
  data={chartData}
  title="System Overview"
/>
```

#### Data Fetching
Charts automatically update when dashboard data is refreshed:
```javascript
// Data is fetched in the dashboard component
const fetchData = useCallback(async () => {
  // ... fetch users and projects data
  // Charts will automatically re-render with new data
}, []);
```

### Chart Customization

#### Colors
Charts use a consistent color scheme:
- **Blue (#3B82F6)**: Primary data
- **Green (#10B981)**: Success/verified data
- **Orange (#F59E0B)**: Warning/unverified data
- **Purple (#8B5CF6)**: Secondary data
- **Red (#EF4444)**: Error/negative data

#### Responsive Design
- Charts automatically resize based on container width
- Mobile-optimized layouts
- Touch-friendly interactions

#### Accessibility
- Screen reader compatible
- Keyboard navigation support
- High contrast color options

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Rate Limiting
- OTP requests: 1 request per 60 seconds
- Login attempts: 5 attempts per 15 minutes
- General API: 100 requests per 15 minutes

## Frontend Integration Notes

### Token Management
1. Store `accessToken` and `refreshToken` in localStorage
2. Include `accessToken` in Authorization header for all API calls
3. Handle 401 responses by attempting token refresh
4. Clear tokens on logout or refresh failure

### Error Handling
1. Display user-friendly error messages
2. Handle network errors gracefully
3. Implement retry logic for failed requests
4. Show loading states during API calls

### Security Considerations
1. Never store sensitive data in localStorage
2. Implement proper token expiration handling
3. Clear tokens on logout
4. Use HTTPS in production
5. Validate all user inputs

## Sample Frontend API Service

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh-token', { refreshToken });
        
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
``` 