import jwt from 'jsonwebtoken';

export const signToken = (payload, expiresIn = null) => {
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'fallback-secret-key', 
    { 
      expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
};
