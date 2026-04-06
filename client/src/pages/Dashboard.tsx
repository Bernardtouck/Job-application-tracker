// src/pages/Dashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import type { Job, JobStatus } from "../types/job.types";
import "./Dashboard.css";

// ─── Types ───────────────────────────────────────────────
interface JobFormData {
  company: string;
  position: string;
  status: JobStatus;
  notes: string;
  location?: string;
  salary?: string;
}

const STATUSES: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

const STATUS_META: Record<JobStatus, { label: string; color: string }> = {
  APPLIED:   { label: "Applied",   color: "#378ADD" },
  INTERVIEW: { label: "Interview", color: "#EF9F27" },
  OFFER:     { label: "Offer",     color: "#1D9E75" },
  REJECTED:  { label: "Rejected",  color: "#E24B4A" },
};

const EMPTY_FORM: JobFormData = {
  company: "", position: "", status: "APPLIED", notes: "", location: "", salary: "",
};

// ─── Sub-components ──────────────────────────────────────

function StatCard({ value, label, accent }: { value: number | string; label: string; accent: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: accent }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META["APPLIED"];
  return (
    <span className="status-badge" style={{ "--badge-color": meta.color } as React.CSSProperties}>
      <span className="badge-dot" />
      {meta.label}
    </span>
  );
}

function Modal({
  title, children, onClose,
}: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function JobForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: JobFormData;
  onSubmit: (data: JobFormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<JobFormData>(initial);
  const set = (key: keyof JobFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form className="job-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="form-row">
        <div className="form-group">
          <label>Company</label>
          <input required value={form.company} onChange={set("company")} placeholder="e.g. Stripe" />
        </div>
        <div className="form-group">
          <label>Position</label>
          <input required value={form.position} onChange={set("position")} placeholder="e.g. Frontend Engineer" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Location</label>
          <input value={form.location} onChange={set("location")} placeholder="e.g. Berlin, Remote" />
        </div>
        <div className="form-group">
          <label>Salary</label>
          <input value={form.salary} onChange={set("salary")} placeholder="e.g. €95k" />
        </div>
      </div>
      <div className="form-group">
        <label>Status</label>
        <select value={form.status} onChange={set("status")}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea value={form.notes} onChange={set("notes")} placeholder="Recruiter name, details, next steps…" rows={3} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : "Save job"}
        </button>
      </div>
    </form>
  );
}

// ─── Main Dashboard ───────────────────────────────────────
export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);
  const [filterStatus, setFilterStatus] = useState<JobStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch ──
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/jobs");
      setJobs(res.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── Create ──
  const handleCreate = async (data: JobFormData) => {
    try {
      setSaving(true);
      await API.post("/jobs", data);
      setShowCreate(false);
      fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  // ── Update ──
  const handleUpdate = async (data: JobFormData) => {
    if (!editJob) return;
    try {
      setSaving(true);
      await API.put(`/jobs/${editJob.id}`, data);
      setEditJob(null);
      fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteJob) return;
    try {
      setSaving(true);
      await API.delete(`/jobs/${deleteJob.id}`);
      setDeleteJob(null);
      fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete job");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ──
  const filtered = jobs.filter((j) => {
    const matchStatus = filterStatus === "ALL" || j.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || j.company.toLowerCase().includes(q) || j.position.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: jobs.length,
    interviews: jobs.filter((j) => j.status === "INTERVIEW").length,
    offers: jobs.filter((j) => j.status === "OFFER").length,
    rate: jobs.length ? Math.round((jobs.filter((j) => j.status !== "REJECTED").length / jobs.length) * 100) : 0,
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" />
              <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity=".5" />
              <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity=".5" />
              <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" />
            </svg>
          </div>
          <span className="brand-name">JobTracker</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <a className="nav-item active" href="#">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
            Dashboard
          </a>
          <a className="nav-item" href="#">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
            Applications
            <span className="nav-badge">{jobs.length}</span>
          </a>
          <a className="nav-item" href="#">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
            Calendar
          </a>
          <div className="nav-section-label" style={{ marginTop: "1.5rem" }}>Insights</div>
          <a className="nav-item" href="#">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            Analytics
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">JD</div>
            <div className="user-details">
              <span className="user-name">Job Hunter</span>
              <span className="user-sub">Spring 2026</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Applications</h1>
            <p className="page-subtitle">Track your job search · Spring 2026</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add job
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, flexShrink: 0 }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
            <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="stats-row">
          <StatCard value={stats.total}      label="Total applied"   accent="#378ADD" />
          <StatCard value={stats.interviews}  label="Interviews"      accent="#EF9F27" />
          <StatCard value={stats.offers}      label="Offers"          accent="#1D9E75" />
          <StatCard value={`${stats.rate}%`} label="Success rate"    accent="#7F77DD" />
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            <input
              className="search-input"
              placeholder="Search company or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {(["ALL", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                className={`filter-pill ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}
                style={filterStatus === s && s !== "ALL" ? { "--pill-color": STATUS_META[s]?.color } as React.CSSProperties : {}}
              >
                {s === "ALL" ? "All" : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-large" />
              <p>Loading your applications…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="12" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="36" cy="12" r="8" fill="#378ADD"/>
                  <path d="M33 12h6M36 9v6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="empty-title">{jobs.length === 0 ? "No applications yet" : "No results found"}</p>
              <p className="empty-sub">{jobs.length === 0 ? "Start tracking your job search" : "Try adjusting your filters"}</p>
              {jobs.length === 0 && (
                <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => setShowCreate(true)}>
                  Add your first job
                </button>
              )}
            </div>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => (
                  <tr key={job.id} style={{ "--row-delay": `${i * 40}ms` } as React.CSSProperties} className="table-row">
                    <td>
                      <div className="company-cell">
                        <div className="company-avatar" style={{ "--av-color": STATUS_META[job.status]?.color || "#378ADD" } as React.CSSProperties}>
                          {job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="company-name">{job.company}</span>
                      </div>
                    </td>
                    <td className="position-cell">{job.position}</td>
                    <td><StatusBadge status={job.status as JobStatus} /></td>
                    <td className="date-cell">{new Date(job.appliedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="notes-cell">{job.notes || <span className="no-notes">—</span>}</td>
                    <td>
                      <div className="row-actions">
                        <button className="action-btn edit-btn" onClick={() => setEditJob(job)} title="Edit">
                          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                        <button className="action-btn delete-btn" onClick={() => setDeleteJob(job)} title="Delete">
                          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      {showCreate && (
        <Modal title="Add new application" onClose={() => setShowCreate(false)}>
          <JobForm initial={EMPTY_FORM} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
        </Modal>
      )}

      {editJob && (
        <Modal title="Edit application" onClose={() => setEditJob(null)}>
          <JobForm
            initial={{ company: editJob.company, position: editJob.position, status: editJob.status as JobStatus, notes: editJob.notes || "", location: "", salary: "" }}
            onSubmit={handleUpdate}
            onCancel={() => setEditJob(null)}
            loading={saving}
          />
        </Modal>
      )}

      {deleteJob && (
        <Modal title="Delete application" onClose={() => setDeleteJob(null)}>
          <div className="delete-confirm">
            <div className="delete-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="delete-title">Delete <strong>{deleteJob.company}</strong>?</p>
            <p className="delete-sub">This will permanently remove the application for <em>{deleteJob.position}</em>. This action cannot be undone.</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setDeleteJob(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? <span className="btn-spinner" /> : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}