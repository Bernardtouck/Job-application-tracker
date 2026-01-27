import { Router } from 'express';
import {
  getUsers,
  createUserHandler,
} from '../controllers/user.controller';

/**
 * User routes
 */
const router = Router();

/**
 * GET /users
 */
router.get('/', getUsers);

/**
 * POST /users
 */
router.post('/', createUserHandler);

export default router;
