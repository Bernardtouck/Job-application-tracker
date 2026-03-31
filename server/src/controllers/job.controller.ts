import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import Joi from "joi";

// Define TypeScript interface for Request body validation
interface CreateJobInput {
  company: string;
  position: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate: string; // ISO date string
  notes?: string;
}

// Joi schema for validating CreateJobInput
const createJobSchema = Joi.object<CreateJobInput>({
  company: Joi.string().required(),
  position: Joi.string().required(),
  status: Joi.string()
    .valid("APPLIED", "INTERVIEW", "OFFER", "REJECTED")
    .required(),
  appliedDate: Joi.string().isoDate().required(),
  notes: Joi.string().optional(),
});

/**
 * GET /jobs
 * Returns all jobs for the authenticated user
 */
export const getJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId; // Access userId from authenticated request
    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /jobs
 * Returns all jobs for the authenticated user
 */
export const createJob = async (req: Request, res: Response) => {
  try {
    // Validate request body against Joi schema
    const { error, value } = createJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const userId = req.user!.userId; // Access userId from authenticated request
    const { company, position, status, appliedDate, notes } = value;
    const job = await prisma.job.create({
      data: {
        company,
        position,
        status: status || "APPLIED", // Default to APPLIED if not provided
        appliedAt: appliedDate ? new Date(appliedDate) : new Date(), // Default to current date if not provided
        notes,
        userId,
      },
    });
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};