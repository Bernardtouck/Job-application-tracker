import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the expected JWT payload
export interface UserPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Middleware to validate JWT in the Authorization header.
 * Protects routes that require authentication.
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied: No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    // Attach the decoded user info to req.user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next(); // Pass control to next middleware/route
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};