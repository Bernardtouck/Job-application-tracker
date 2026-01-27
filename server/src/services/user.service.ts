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
 * Creates a new user.
 */
export const createUser = async (data: CreateUserInput) => {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
};
