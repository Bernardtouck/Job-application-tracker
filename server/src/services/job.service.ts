import prisma from "../lib/prisma";

// Typ for creating a job
interface CreateJobInput {
  company: string;  
  position: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate: string; // ISO date string
  notes?: string;
}

// Typ for updating a job
interface UpdateJobInput {
  company?: string;
  position?: string;
  status?: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate?: string; // ISO date string
  notes?: string;
}

/**
 * Create a new job
 */
export const createJobService = async (
  data: CreateJobInput,
  userId: string
) => {
  return prisma.job.create({
    data: {
      company: data.company,
      position: data.position,
      status: data.status,
      appliedAt: new Date(data.appliedDate),
      notes: data.notes,
      userId,
    },
  });
};


/**
 * Get all jobs for a user
 */
export const getJobsService = async (userId: string) => {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get one job by ID (with ownership check)
 */
export const getJobByIdService = async (
  jobId: string,
  userId: string
) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== userId) {
    return null;
  }

  return job;
};

/**
 * Update a job (only if owned by user)
 */
export const updateJobService = async (
  jobId: string,
  userId: string,
  data: UpdateJobInput
) => {
  const existingJob = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!existingJob || existingJob.userId !== userId) {
    return null;
  }

  return prisma.job.update({
    where: { id: jobId },
    data: {
      ...data,
      appliedAt: data.appliedDate
        ? new Date(data.appliedDate)
        : undefined,
    },
  });
};

/**
 * Delete a job (only if owned by user)
 */
export const deleteJobService = async (
  jobId: string,
  userId: string
) => {
  const existingJob = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!existingJob || existingJob.userId !== userId) {
    return null;
  }

  await prisma.job.delete({
    where: { id: jobId },
  });

  return true;
};