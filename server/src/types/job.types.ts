// Centralises all job-related types to keep code organized and maintainable
export type JobStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface CreateJobInput {
  company: string;
  position: string;
  status: JobStatus;
  appliedAt: string; // ISO string
  notes?: string,
  location?: string;
  salary?: string;
  contractType?: string;  
  workMode?:    string;
}

export interface UpdateJobInput {
  company?: string;
  position?: string;
  status?: JobStatus;
  appliedAt?: string;
  notes?: string,
  location?: string;
  salary?: string;
  contractType?: string;
  workMode?:    string;
}