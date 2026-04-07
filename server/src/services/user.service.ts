import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

// ── Types ────────────────────────────────────────────────
interface CreateUserInput {
  email:    string;
  password: string;
}

interface UpdateProfileInput {
  username?:     string;
  avatarBase64?: string;
}

// ── Helpers ──────────────────────────────────────────────

/** Strip password before returning user data */
const safeUser = (user: { id: string; email: string; username: string | null; avatarBase64: string | null; createdAt: Date }) => ({
  id:           user.id,
  email:        user.email,
  username:     user.username,
  avatarBase64: user.avatarBase64,
  createdAt:    user.createdAt,
});

// ── Service functions ────────────────────────────────────

/**
 * Retrieves all users (id, email, createdAt) — no passwords
 */
export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, email: true, createdAt: true },
  });
};

/**
 * Creates a new user with a hashed password.
 */
export const createUser = async (data: CreateUserInput) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, password: hashedPassword },
  });
  return safeUser(user);
};

/**
 * Get a single user's profile by ID (no password).
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return safeUser(user);
};

/**
 * Update username and/or avatarBase64 for a user.
 * Validates base64 size limit (max 2MB encoded string ≈ 2.7M chars).
 */
export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  // Guard: base64 strings can get very large — limit to ~100MB image
  if (data.avatarBase64 && data.avatarBase64.length > 100_800_000) {
    throw new Error("Avatar image is too large. Maximum size is 2MB.");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.username     !== undefined && { username:     data.username }),
      ...(data.avatarBase64 !== undefined && { avatarBase64: data.avatarBase64 === "" ? null : data.avatarBase64 }),
    },
  });

  return safeUser(user);
};