import { Request, Response } from "express";
import Joi from "joi";
import {
  createJobService,
  getJobsService,
} from "../services/job.service";

// Type pour validation
interface CreateJobInput {
  company: string;
  position: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate: string;
  notes?: string;
}

// Joi validation
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
 * Get all jobs for authenticated user
 */
export const getJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const jobs = await getJobsService(userId);

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /jobs
 * Create a new job
 */
export const createJob = async (req: Request, res: Response) => {
  try {
    const { error, value } = createJobSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const userId = req.user!.userId;

    const job = await createJobService(value, userId);

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};