export type JobStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface Job {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  appliedAt: string;
  notes?: string;
  userId: string;
  createdAt: string;
}