import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

/**
 * Retrieves all users from the database.
 */
export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
};

interface CreateUserInput {
  email: string;
  password: string;
}

/**
 * Creates a new user with a hashed password.
 */
export const createUser = async (data: CreateUserInput) => {
  // Hash the password before storing it
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  // create user with hashed password
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
    },
  });
  // return user without password
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
};
