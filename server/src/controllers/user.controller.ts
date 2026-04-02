import { Request, Response } from 'express';
import { getAllUsers, createUser } from '../services/user.service';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import Joi from 'joi';
import { compare} from 'bcrypt'; // compare bcrypt hash
import jwt from 'jsonwebtoken'; // JWT for token generation


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
    const safeUsers = users.map(u => ({ id: u.id, email: u.email, createdAt: u.createdAt }));
    res.json(safeUsers);
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

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT if successful
 */
export const loginUserHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user not found
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // compare password with hashed password
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // generate JWT for authenticated user
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,  // the secret key for signing the token
      { expiresIn: '1h' }       // Expiration of the token in 1 hour
    );

    // return the token
    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
