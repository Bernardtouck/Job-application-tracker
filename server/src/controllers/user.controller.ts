import { Request, Response } from 'express';
import { getAllUsers, createUser } from '../services/user.service';

/**
 * GET /users
 * Returns all users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /users
 * Creates a new user
 */
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation (minimal for now)
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await createUser({ email, password });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
