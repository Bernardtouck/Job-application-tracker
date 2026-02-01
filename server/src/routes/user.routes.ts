import { Router } from 'express';
import {
  getUsers,
  createUserHandler,
  loginUserHandler,
} from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware'; // Import du middleware

const router = Router();

/**
 * GET /users
 * Protected route: Requires authentication
 */
router.get('/', authenticateJWT, getUsers); // Ajout du middleware ici

/**
 * POST /users
 * Protected route: Requires authentication
 */
router.post('/', authenticateJWT, createUserHandler); // Ajout du middleware ici

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT
 */
router.post('/login', loginUserHandler);

export default router;
