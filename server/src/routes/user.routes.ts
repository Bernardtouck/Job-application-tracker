import { Router } from 'express';
import {
  getUsers,
  createUserHandler,
  loginUserHandler,
  getProfile,
  updateProfile,
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
 * Register a new user
 * Public route — no authentication required
 */
router.post('/', createUserHandler); // Add the authentication middleware here

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT
 * Public route — no authentication required
 */
router.post('/login', loginUserHandler);
/**
 * GET /users/profile
 * Authenticates the user and returns their profile
 * Protected route: Requires authentication
 */
router.get("/profile", authenticateJWT, getProfile);
/**
 * PUT /users/profile
 * Updates the authenticated user's profile (username and/or avatar)
 * Protected route: Requires authentication
 */
router.put("/profile", authenticateJWT, updateProfile);

export default router;
