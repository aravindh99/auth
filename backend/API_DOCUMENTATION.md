# API Documentation

This document provides detailed information about all available API endpoints, including request/response formats and examples.

## Table of Contents
- [Authentication APIs](#authentication-apis)
- [User Management APIs](#user-management-apis)
- [Project Management APIs](#project-management-apis)
- [Statistics APIs](#statistics-apis)

## Authentication APIs

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Example Corp",
  "role": "ADMIN"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Example Corp",
    "role": "ADMIN",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Logout
```http
POST /api/auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset instructions sent to email"
}
```

### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_123",
  "password": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## User Management APIs

### List Users
```http
GET /api/users
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `role` (optional): Filter by role

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "ADMIN",
        "companyName": "Example Corp",
        "isSuspended": false,
        "subUserLimit": 5,
        "createdAt": "2024-03-20T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

### Create User
```http
POST /api/users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "companyName": "Example Corp",
  "role": "SUB_USER",
  "subUserLimit": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user_124",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "SUB_USER",
    "companyName": "Example Corp",
    "subUserLimit": 5,
    "createdAt": "2024-03-20T11:00:00Z"
  }
}
```

### Update User
```http
PUT /api/users/:id
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "companyName": "Updated Corp",
  "subUserLimit": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_124",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "SUB_USER",
    "companyName": "Updated Corp",
    "subUserLimit": 10,
    "updatedAt": "2024-03-20T12:00:00Z"
  }
}
```

### Delete User
```http
DELETE /api/users/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Suspend User
```http
POST /api/users/:id/suspend
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "id": "user_124",
    "isSuspended": true,
    "suspendedAt": "2024-03-20T13:00:00Z"
  }
}
```

### Unsuspend User
```http
POST /api/users/:id/unsuspend
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User unsuspended successfully",
  "data": {
    "id": "user_124",
    "isSuspended": false,
    "unsuspendedAt": "2024-03-20T14:00:00Z"
  }
}
```

## Project Management APIs

### List Projects
```http
GET /api/projects
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_123",
        "name": "Example Project",
        "description": "Project description",
        "createdBy": "user_123",
        "createdAt": "2024-03-20T10:00:00Z",
        "users": [
          {
            "id": "user_124",
            "email": "user@example.com",
            "role": "SUB_USER"
          }
        ]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

### Create Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "users": ["user_124", "user_125"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "proj_124",
    "name": "New Project",
    "description": "Project description",
    "createdBy": "user_123",
    "createdAt": "2024-03-20T15:00:00Z",
    "users": [
      {
        "id": "user_124",
        "email": "user@example.com",
        "role": "SUB_USER"
      },
      {
        "id": "user_125",
        "email": "user2@example.com",
        "role": "SUB_USER"
      }
    ]
  }
}
```

### Update Project
```http
PUT /api/projects/:id
```

**Request Body:**
```json
{
  "name": "Updated Project",
  "description": "Updated description",
  "users": ["user_124", "user_126"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "proj_124",
    "name": "Updated Project",
    "description": "Updated description",
    "updatedAt": "2024-03-20T16:00:00Z",
    "users": [
      {
        "id": "user_124",
        "email": "user@example.com",
        "role": "SUB_USER"
      },
      {
        "id": "user_126",
        "email": "user3@example.com",
        "role": "SUB_USER"
      }
    ]
  }
}
```

### Delete Project
```http
DELETE /api/projects/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## Statistics APIs

### User Statistics
```http
GET /api/users/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "activeUsers": 80,
    "suspendedUsers": 20,
    "usersByRole": {
      "SUPER_ADMIN": 1,
      "ADMIN": 19,
      "SUB_USER": 80
    },
    "recentActivity": [
      {
        "id": "user_124",
        "action": "LOGIN",
        "timestamp": "2024-03-20T17:00:00Z"
      }
    ]
  }
}
```

### Project Statistics
```http
GET /api/projects/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalProjects": 50,
    "activeProjects": 45,
    "projectsByUser": {
      "user_123": 10,
      "user_124": 5
    },
    "recentActivity": [
      {
        "id": "proj_124",
        "action": "CREATE",
        "timestamp": "2024-03-20T18:00:00Z"
      }
    ]
  }
}
```

## Dashboard Analytics & Charts

### Overview
The Xtown Authenticator dashboard provides comprehensive analytics with interactive charts for both Super Admin and Project Admin users. The charts are built using Recharts library and display real-time data from the system.

### Chart Types

#### 1. User Verification Status (Pie Chart)
Shows the distribution of verified vs unverified users.

**Super Admin View:**
- Displays all users across the system
- Shows overall verification status

**Project Admin View:**
- Displays only sub-users created by the admin
- Shows verification status of managed users

#### 2. System Overview (Bar Chart)
Displays comprehensive system statistics in a bar chart format.

**Super Admin View:**
- Total Users
- Total Projects
- Total Companies
- Total Admins
- Total Sub Users

**Project Admin View:**
- Sub Users (created by admin)
- Assigned Projects
- Verified Sub Users
- Unverified Sub Users
- Sub User Limit

### Chart Data Sources

#### User Statistics API
```http
GET /api/users/stats
```

**Response for Charts:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "projectAdmins": 20,
    "subUsers": 80,
    "verifiedUsers": 85,
    "unverifiedUsers": 15
  }
}
```

#### Project Statistics API
```http
GET /api/projects/stats
```

**Response for Charts:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 50,
    "activeProjects": 45,
    "inactiveProjects": 5
  }
}
```

### Chart Integration

#### Frontend Implementation
```javascript
// Chart components
import UserStatsPieChart from '../components/charts/UserStatsPieChart';
import TotalCountsBarChart from '../components/charts/TotalCountsBarChart';

// Usage in dashboard
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

#### Data Processing
```javascript
// Calculate chart data based on user role
const getChartData = () => {
  if (isSuperAdmin()) {
    return {
      verifiedUsers: totalVerifiedUsers,
      unverifiedUsers: totalUnverifiedUsers,
      barData: [
        { name: 'Users', value: totalUsers, color: '#3B82F6' },
        { name: 'Projects', value: totalProjects, color: '#10B981' },
        { name: 'Companies', value: totalCompanies, color: '#F59E0B' }
      ]
    };
  } else if (isProjectAdmin()) {
    return {
      verifiedUsers: myVerifiedSubUsers,
      unverifiedUsers: myUnverifiedSubUsers,
      barData: [
        { name: 'Sub Users', value: mySubUsers, color: '#EF4444' },
        { name: 'Assigned Projects', value: assignedProjects, color: '#10B981' }
      ]
    };
  }
};
```

### Chart Features

#### Interactive Elements
- **Tooltips**: Display detailed information on hover
- **Legends**: Color-coded indicators for data categories
- **Responsive Design**: Automatically adapts to screen size
- **Touch Support**: Mobile-friendly interactions

#### Visual Design
- **Color Scheme**: Consistent branding with Xtown colors
- **Typography**: Clean, readable fonts
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Screen reader compatible

#### Real-time Updates
- Charts automatically refresh when data changes
- Live updates from API endpoints
- Optimized performance with React hooks

### Chart Customization

#### Color Palette
```javascript
const chartColors = {
  primary: '#3B82F6',    // Blue
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Orange
  secondary: '#8B5CF6',  // Purple
  danger: '#EF4444'      // Red
};
```

#### Responsive Breakpoints
- **Desktop**: Full chart display with detailed tooltips
- **Tablet**: Optimized layout with simplified tooltips
- **Mobile**: Stacked layout with touch-friendly controls

### Performance Considerations

#### Data Optimization
- Efficient data fetching with React Query
- Memoized chart components
- Lazy loading for large datasets

#### Rendering Optimization
- Virtual scrolling for large data sets
- Debounced updates to prevent excessive re-renders
- Optimized chart library configuration

## Error Responses

All APIs may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
``` 