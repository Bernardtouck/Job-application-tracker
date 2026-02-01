import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the expected type for `user` directly in the middleware.
interface UserPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to check and validate the JWT token in the Authorization header.
 * It protects routes that require authentication.
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract the Authorization header from the request
  const authHeader = req.headers.authorization;

  // If no authorization header is provided, return an error (Access denied)
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied' });
  }

  // Get the token from the Authorization header
  const token = authHeader.split(' ')[1]; // The token is after 'Bearer'

  try {
    // Verify the token using jwt.verify() and decode the token
    // The secret key is stored in an environment variable
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as UserPayload;  // Cast to the specific type of the payload

    // Attach the decoded user data to the request object (req.user)
    (req as Request & { user: UserPayload }).user = {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat, // Optional: Can be used if required
      exp: decoded.exp, // Optional: Can be used if required
    };

    // Call next() to pass control to the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, return an error (Forbidden)
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
