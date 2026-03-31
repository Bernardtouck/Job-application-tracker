import {Router} from 'express';
import { getJobs, createJob } from '../controllers/job.controller';
import { authenticateJWT } from '../middleware/auth.middleware'; // Import of the authentication middleware

const router = Router();
/**
 * GET /jobs
 * Returns all jobs for the authenticated user
 * Protected route → requires JWT authentication
 */
router.get('/', authenticateJWT, getJobs);

/**
 * GET /jobs
 * Returns all jobs for the authenticated user
 * Protected route → requires JWT authentication
 */
router.post('/', authenticateJWT, createJob);

export default router;