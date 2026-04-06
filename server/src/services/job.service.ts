import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateJobInput, UpdateJobInput, JobStatus } from "../types/job.types";

// Centralises all job-related database operations to keep controllers clean and focused on HTTP logic
type JobPayload = Prisma.JobGetPayload<{}>;

/**
 * Create a new job for a user
 */
export const createJobService = async (
  data: CreateJobInput,
  userId: string
): Promise<JobPayload> => {
  return prisma.job.create({
    data: {
      company: data.company,
      position: data.position,
      status: data.status,
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : new Date(),
      notes: data.notes,
      location: data.location,
      salary: data.salary,
      userId,
    },
  });
};

/**
 * Get all jobs for a user, ordered by creation date desc
 */
export const getJobsService = async (userId: string): Promise<JobPayload[]> => {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get a single job by ID (only if owned by the user)
 */
export const getJobByIdService = async (
  jobId: string,
  userId: string
): Promise<JobPayload | null> => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== userId) return null;
  return job;
};

/**
 * Update a job (only if owned by the user)
 */
export const updateJobService = async (
  jobId: string,
  userId: string,
  data: UpdateJobInput
): Promise<JobPayload | null> => {
  const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existingJob || existingJob.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.job.update({
    where: { id: jobId },
    data: {
      ...data,
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
    },
  });
};

/**
 * Delete a job (only if owned by the user)
 */
export const deleteJobService = async (
  jobId: string,
  userId: string
): Promise<boolean> => {
  const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existingJob || existingJob.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.job.delete({ where: { id: jobId } });
  return true;
};