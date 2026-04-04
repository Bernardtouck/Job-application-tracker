// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import type { Job, JobStatus } from "../types/job.types";
import "./Dashboard.css";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get("/jobs");
        setJobs(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch jobs");
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={() => { logout(); navigate("/login"); }}>
          Logout
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="jobs-list">
        {jobs.length === 0 && <p>No jobs found.</p>}

        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Position:</strong> {job.position}</p>
            <p><strong>Status:</strong> {job.status as JobStatus}</p>
            <p><strong>Applied:</strong> {new Date(job.appliedAt).toLocaleDateString()}</p>
            {job.notes && <p><strong>Notes:</strong> {job.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}