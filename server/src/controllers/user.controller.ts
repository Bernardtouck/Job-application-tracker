import { Request, Response } from 'express';
import { getAllUsers, createUser } from '../services/user.service';
import { Prisma } from '@prisma/client';
import Joi from 'joi';

/**
 * Joi schema for creating a user
 * Centralizes validation rules for reuse & clarity
 */
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/**
 * GET /users
 * Returns all users without passwords
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
    // Validate request body
    const { error, value } = createUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    // Destructure validated values
    const { email, password } = value;

    const user = await createUser({ email, password });

    res.status(201).json(user);
  } catch (error) {
    // Handle unique constraint error (email already exists)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Generic error handling
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
