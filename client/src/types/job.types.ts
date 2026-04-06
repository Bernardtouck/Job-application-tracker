// src/types/job.types.ts

export type JobStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface Job {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  appliedAt: string;
  notes?: string;
  location?: string;  
  salary?: string;
  contractType?: string;
  workMode?:    string;    
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface JobPayload {
  company: string;
  position: string;
  status: JobStatus;
  notes?: string;
  location?: string;
  salary?: string;
  contractType?: string;
  workMode?:    string;
}