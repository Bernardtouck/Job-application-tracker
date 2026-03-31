// Centralises all job-related types to keep code organized and maintainable
export type JobStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface CreateJobInput {
  company: string;
  position: string;
  status: JobStatus;
  appliedDate: string; // ISO string
  notes?: string;
}

export interface UpdateJobInput {
  company?: string;
  position?: string;
  status?: JobStatus;
  appliedDate?: string;
  notes?: string;
}