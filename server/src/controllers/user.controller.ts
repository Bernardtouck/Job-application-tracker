import { Request, Response } from "express";
import { getAllUsers, createUser, getUserProfile, updateUserProfile } from "../services/user.service";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import Joi from "joi";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

// ── Validation schemas ───────────────────────────────────
const createUserSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
// For profile updates, at least one field must be provided
const updateProfileSchema = Joi.object({
  username:     Joi.string().min(2).max(32).optional().allow(""),
  avatarBase64: Joi.string().optional().allow(""),
}).min(1);

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const user = await createUser({ email: value.email, password: value.password });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUserHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid email or password" });
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id:           user.id,
        email:        user.email,
        username:     user.username,
        avatarBase64: user.avatarBase64,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const profile = await getUserProfile(req.user.userId);
    if (!profile) return res.status(404).json({ message: "User not found" });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const updated = await updateUserProfile(req.user.userId, value);
    res.json(updated);
  } catch (err: any) {
    console.error(err);
    if (err.message?.includes("too large")) return res.status(413).json({ message: err.message });
    res.status(500).json({ message: "Internal server error" });
  }
};