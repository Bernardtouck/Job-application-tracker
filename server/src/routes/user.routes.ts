import { Router } from 'express';
import {
  getUsers,
  createUserHandler,
  loginUserHandler,
} from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware'; // Import of the authentication middleware

const router = Router();

/**
 * GET /users
 * Protected route: Requires authentication
 */
router.get('/', authenticateJWT, getUsers); // Add the authentication middleware here

/**
 * POST /users
 * Protected route: Requires authentication
 */
router.post('/', createUserHandler); // Add the authentication middleware here

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT
 */
router.post('/login', loginUserHandler);

export default router;
