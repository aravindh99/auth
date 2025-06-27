import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Security and CORS middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userManagementRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid JSON payload' 
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
