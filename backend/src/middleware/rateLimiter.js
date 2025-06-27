import rateLimit from 'express-rate-limit';

// Basic rate limiter implementation
const rateLimitMap = new Map();

const cleanupOldEntries = () => {
  const now = Date.now();
  const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
  
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.windowStart > CLEANUP_INTERVAL) {
      rateLimitMap.delete(key);
    }
  }
};

// Clean up old entries every 10 minutes
setInterval(cleanupOldEntries, 10 * 60 * 1000);

// Function to clear rate limit data (useful for development)
export const clearRateLimitData = () => {
  rateLimitMap.clear();
  console.log('✅ Rate limit data cleared');
};

export const createRateLimiter = (windowMs = 15 * 60 * 1000, maxAttempts = 5) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    let userData = rateLimitMap.get(identifier);
    
    if (!userData || now - userData.windowStart > windowMs) {
      // Reset window
      userData = {
        count: 0,
        windowStart: now
      };
    }
    
    userData.count++;
    rateLimitMap.set(identifier, userData);
    
    if (userData.count > maxAttempts) {
      const timeLeft = Math.ceil((windowMs - (now - userData.windowStart)) / 1000);
      return res.status(429).json({
        message: 'Too many requests',
        retryAfter: timeLeft,
        limit: maxAttempts,
        windowMs: windowMs / 1000
      });
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxAttempts,
      'X-RateLimit-Remaining': Math.max(0, maxAttempts - userData.count),
      'X-RateLimit-Reset': new Date(userData.windowStart + windowMs).toISOString()
    });
    
    next();
  };
};

// Increased limits for development
const isDevelopment = process.env.NODE_ENV === 'development';

// Specific rate limiters for different endpoints
export const authRateLimiter = createRateLimiter(15 * 60 * 1000, isDevelopment ? 50 : 5); // Increased for dev
export const generalRateLimiter = createRateLimiter(15 * 60 * 1000, isDevelopment ? 500 : 100); // Increased for dev

// General rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (isDevelopment ? 50 : 5), // Increased for dev
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for OTP requests
export const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDevelopment ? 10 : 1, // Increased for dev
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait a minute before requesting another OTP.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset attempts
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 20 : 3, // Increased for dev
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Significantly increased for development
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});