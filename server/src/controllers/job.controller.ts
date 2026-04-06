import { Request, Response } from "express";
import Joi from "joi";
import {
  createJobService,
  getJobsService,
  updateJobService,
  deleteJobService,
} from "../services/job.service";
import { CreateJobInput, UpdateJobInput } from "../types/job.types";

/**
 * Joi schema for creating a job
 */
const createJobSchema = Joi.object<CreateJobInput>({
  company: Joi.string().required(),
  position: Joi.string().required(),
  status: Joi.string()
    .valid("APPLIED", "INTERVIEW", "OFFER", "REJECTED")
    .required(),
  appliedAt: Joi.string().isoDate().optional,
  notes: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''),
  salary: Joi.string().optional().allow(''),
});

/**
 * Joi schema for updating a job (partial update)
 */
const updateJobSchema = Joi.object<UpdateJobInput>({
  company: Joi.string().optional(),
  position: Joi.string().optional(),
  status: Joi.string()
    .valid("APPLIED", "INTERVIEW", "OFFER", "REJECTED")
    .optional(),
  appliedAt: Joi.string().isoDate().optional(),
  notes: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''),
  salary: Joi.string().optional().allow(''),
});

/**
 * GET /jobs
 */
export const getJobs = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jobs = await getJobsService(req.user.userId);
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /jobs
 */
export const createJob = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { error, value } = createJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const job = await createJobService(value, req.user.userId);
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /jobs/:id
 */
export const updateJob = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jobId = String(req.params.id);

    const { error, value } = updateJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedJob = await updateJobService(
      jobId,
      req.user.userId,
      value
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: "Job not found or unauthorized",
      });
    }

    res.json(updatedJob);
  } catch (err: any) {
    console.error(err);

    if (err.message === "Unauthorized") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /jobs/:id
 */
export const deleteJob = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jobId = String(req.params.id);

    await deleteJobService(jobId, req.user.userId);

    // REST standard
    res.status(204).send();
  } catch (err: any) {
    console.error(err);

    if (err.message === "Unauthorized") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};