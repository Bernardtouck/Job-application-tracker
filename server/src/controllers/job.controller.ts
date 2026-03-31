import { Request, Response } from "express";
import Joi from "joi";
import { createJobService, getJobsService } from "../services/job.service";
import { CreateJobInput } from "../types/job.types";

// Joi schema for creating a job - centralizes validation rules for clarity and reuse
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
 * Protected route → requires JWT authentication
 */
export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await getJobsService(req.user!.userId);
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /jobs
 * Creates a new job for the authenticated user
 * Protected route → requires JWT authentication
 */
export const createJob = async (req: Request, res: Response) => {
  try {
    const { error, value } = createJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const job = await createJobService(value, req.user!.userId);
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};