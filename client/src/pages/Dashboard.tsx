import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { parseJobText, parseJobImage } from "../api/parser.api";
import { useAuth } from "../hooks/useAuth";
import type { Job, JobStatus } from "../types/job.types";
import type { ParsedJob } from "../types/parser.types";
import type { UserProfile } from "../types/user.types";
import ProfileModal from "../components/ProfileModal";
import "./Dashboard.css";

interface JobFormData {
  company: string; position: string; status: JobStatus;
  notes: string; location: string; salary: string;
  contractType: string; workMode: string;
}

const STATUSES: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const STATUS_META: Record<JobStatus, { label: string; color: string }> = {
  APPLIED:   { label: "Applied",   color: "#5B8FD4" },
  INTERVIEW: { label: "Interview", color: "#EF9F27" },
  OFFER:     { label: "Offer",     color: "#3DBE7A" },
  REJECTED:  { label: "Rejected",  color: "#E24B4A" },
};
const EMPTY_FORM: JobFormData = {
  company: "", position: "", status: "APPLIED",
  notes: "", location: "", salary: "", contractType: "", workMode: "",
};

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
      <span className="badge-dot" />{meta.label}
    </span>
  );
}

function Modal({ title, children, onClose, wide }: {
  title: string; children: React.ReactNode; onClose: () => void; wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-box${wide ? " modal-box--wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "#3DBE7A" : pct >= 55 ? "#EF9F27" : "#E24B4A";
  return (
    <div className="confidence-wrap">
      <div className="confidence-bar">
        <div className="confidence-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="confidence-label" style={{ color }}>{pct}% confidence</span>
    </div>
  );
}

function ParseJobModal({ onParsed }: { onParsed: (data: ParsedJob) => void; onClose: () => void }) {
  const [mode, setMode]       = useState<"text" | "image">("text");
  const [text, setText]       = useState("");
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<ParsedJob | null>(null);
  const [rawText, setRawText] = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  const handleParse = async () => {
    setError(""); setResult(null);
    if (mode === "text" && text.trim().length < 50) { setError("Please paste at least 50 characters"); return; }
    if (mode === "image" && !file) { setError("Please select an image file"); return; }
    setLoading(true);
    try {
      const res = mode === "text" ? await parseJobText(text) : await parseJobImage(file!);
      if (!res.success || !res.data) { setError(res.message || "Parsing failed"); return; }
      setResult(res.data);
      if (res.rawText) setRawText(res.rawText);
    } catch (err: any) {
      setError(err.response?.data?.message || "Parsing failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="parse-modal">
      <div className="parse-tabs">
        <button className={`parse-tab${mode === "text" ? " active" : ""}`} onClick={() => { setMode("text"); setResult(null); setError(""); }}>
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
          Paste text
        </button>
        <button className={`parse-tab${mode === "image" ? " active" : ""}`} onClick={() => { setMode("image"); setResult(null); setError(""); }}>
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
          Upload screenshot
        </button>
      </div>
      <div className="parse-body">
        {mode === "text" ? (
          <div className="form-group">
            <label>Job posting text <span className="label-hint">(EN or DE)</span></label>
            <textarea className="parse-textarea" value={text} onChange={(e) => setText(e.target.value)}
              placeholder={"Paste the full job description here…\n\nExample:\nSenior Frontend Engineer at Stripe\nLocation: Berlin · Full-time · Hybrid\nSalary: €80,000 - €100,000 / year"}
              rows={10} disabled={loading} />
            <div className="char-count">{text.length} / 20,000</div>
          </div>
        ) : (
          <div className="upload-area" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }}
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(""); }} />
            {file ? (
              <div className="upload-selected">
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 24, height: 24, color: "#3DBE7A" }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="upload-filename">{file.name}</span>
                <span className="upload-change">Click to change</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M24 16v16M16 24h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p className="upload-title">Click to upload screenshot</p>
                <p className="upload-sub">PNG, JPG, WEBP · max 5 MB</p>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="parse-error">
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, flexShrink: 0 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {!result && (
          <button className="btn-primary parse-btn" onClick={handleParse} disabled={loading}>
            {loading ? (<><span className="btn-spinner" />{mode === "image" ? "Running OCR…" : "Parsing…"}</>) : (
              <><svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>Parse & extract</>
            )}
          </button>
        )}
        {result && (
          <div className="parse-result">
            <div className="parse-result-header">
              <span className="parse-result-title">Extracted data</span>
              <ConfidenceBar value={result.confidence} />
            </div>
            <div className="parse-fields">
              {[
                { label: "Job title",     value: result.title },
                { label: "Company",       value: result.company },
                { label: "Location",      value: result.location },
                { label: "Salary",        value: result.salary },
                { label: "Contract type", value: result.contractType !== "unknown" ? result.contractType : null },
                { label: "Work mode",     value: result.workMode !== "unknown" ? result.workMode : null },
                { label: "Language",      value: result.language !== "unknown" ? result.language.toUpperCase() : null },
              ].map(({ label, value }) => (
                <div key={label} className="parse-field">
                  <span className="parse-field-label">{label}</span>
                  <span className={`parse-field-value${!value ? " parse-field-empty" : ""}`}>{value ?? "Not found"}</span>
                </div>
              ))}
            </div>
            {mode === "image" && rawText && (
              <details className="raw-text-details">
                <summary>View raw OCR text</summary>
                <pre className="raw-text">{rawText}</pre>
              </details>
            )}
            <div className="parse-result-actions">
              <button className="btn-secondary" onClick={() => { setResult(null); setRawText(""); }}>Try again</button>
              <button className="btn-primary" onClick={() => onParsed(result)}>Use this data →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobForm({ initial, onSubmit, onCancel, loading }: {
  initial: JobFormData; onSubmit: (data: JobFormData) => void; onCancel: () => void; loading: boolean;
}) {
  const [form, setForm] = useState<JobFormData>(initial);
  useEffect(() => { setForm(initial); }, [initial]);
  const set = (key: keyof JobFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form className="job-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="form-row">
        <div className="form-group"><label>Company</label><input required value={form.company} onChange={set("company")} placeholder="e.g. Stripe" /></div>
        <div className="form-group"><label>Position</label><input required value={form.position} onChange={set("position")} placeholder="e.g. Frontend Engineer" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Location</label><input value={form.location} onChange={set("location")} placeholder="e.g. Berlin, Remote" /></div>
        <div className="form-group"><label>Salary</label><input value={form.salary} onChange={set("salary")} placeholder="e.g. €95k" /></div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Contract type</label>
          <select value={form.contractType} onChange={set("contractType")}>
            <option value="">— Select —</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="mini-job">Mini-job</option>
            <option value="freelance">Freelance</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        <div className="form-group">
          <label>Work mode</label>
          <select value={form.workMode} onChange={set("workMode")}>
            <option value="">— Select —</option>
            <option value="on-site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Status</label>
        <select value={form.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}</select>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea value={form.notes} onChange={set("notes")} placeholder="Recruiter name, details, next steps…" rows={3} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? <span className="btn-spinner" /> : "Save job"}</button>
      </div>
    </form>
  );
}

// ─── Main Dashboard ───────────────────────────────────
export default function Dashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [jobs, setJobs]               = useState<Job[]>([]);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [showParse, setShowParse]     = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [profile, setProfile]         = useState<UserProfile | null>(() => {
    try { return JSON.parse(localStorage.getItem("userProfile") || "null"); }
    catch { return null; }
  });
  const [editJob, setEditJob]         = useState<Job | null>(null);
  const [deleteJob, setDeleteJob]     = useState<Job | null>(null);
  const [createForm, setCreateForm]   = useState<JobFormData>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<JobStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeNav, setActiveNav]     = useState<"dashboard" | "applications" | "analytics">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    try { setLoading(true); const res = await API.get("/jobs"); setJobs(res.data); setError(""); }
    catch (err: any) { setError(err.response?.data?.message || "Failed to fetch jobs"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (profile && !profile.username) { setIsFirstLogin(true); setShowProfile(true); }
  }, []);

  const handleCreate = async (data: JobFormData) => {
    try { setSaving(true); await API.post("/jobs", data); setShowCreate(false); setCreateForm(EMPTY_FORM); fetchJobs(); }
    catch (err: any) { setError(err.response?.data?.message || "Failed to create job"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data: JobFormData) => {
    if (!editJob) return;
    try { setSaving(true); await API.put(`/jobs/${editJob.id}`, data); setEditJob(null); fetchJobs(); }
    catch (err: any) { setError(err.response?.data?.message || "Failed to update job"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteJob) return;
    try { setSaving(true); await API.delete(`/jobs/${deleteJob.id}`); setDeleteJob(null); fetchJobs(); }
    catch (err: any) { setError(err.response?.data?.message || "Failed to delete job"); }
    finally { setSaving(false); }
  };

  const handleParsed = (parsed: ParsedJob) => {
    setCreateForm({
      company:      parsed.company      ?? "",
      position:     parsed.title        ?? "",
      location:     parsed.location     ?? "",
      salary:       parsed.salary       ?? "",
      contractType: parsed.contractType !== "unknown" ? parsed.contractType : "",
      workMode:     parsed.workMode     !== "unknown" ? parsed.workMode     : "",
      status: "APPLIED", notes: "",
    });
    setShowParse(false);
    setShowCreate(true);
  };

  const filtered = jobs.filter((j) => {
    const matchStatus = filterStatus === "ALL" || j.status === filterStatus;
    const q = searchQuery.toLowerCase();
    return matchStatus && (!q || j.company.toLowerCase().includes(q) || j.position.toLowerCase().includes(q));
  });

  const handleLogout = () => {
    logout();
    localStorage.removeItem("userProfile");
    navigate("/");
  };

  const stats = {
    total:      jobs.length,
    interviews: jobs.filter((j) => j.status === "INTERVIEW").length,
    offers:     jobs.filter((j) => j.status === "OFFER").length,
    rate: (() => {
      const decided = jobs.filter((j) => j.status === "OFFER" || j.status === "REJECTED").length;
      if (decided === 0) return 0;
      return Math.round((jobs.filter((j) => j.status === "OFFER").length / decided) * 100);
    })(),
  };

  return (
    <div className="app-shell">

      {/* ── Mobile overlay ── */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Mobile topbar ── */}
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <svg viewBox="0 0 40 40" fill="none" style={{ width: 26, height: 26 }}>
            <rect x="4" y="14" width="32" height="22" rx="4" fill="#F5A623" opacity="0.15" stroke="#F5A623" strokeWidth="1.5"/>
            <path d="M14 14V11a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="20" cy="22" r="2.5" fill="#F5A623"/>
          </svg>
          Job<span>Tracker</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-wrap">
            <svg viewBox="0 0 40 40" fill="none" style={{ width: 32, height: 32 }}>
              <rect x="4" y="14" width="32" height="22" rx="4" fill="#F5A623" opacity="0.15" stroke="#F5A623" strokeWidth="1.5"/>
              <path d="M14 14V11a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4" y1="22" x2="36" y2="22" stroke="#F5A623" strokeWidth="1" opacity="0.4"/>
              <circle cx="20" cy="22" r="2.5" fill="#F5A623"/>
              <line x1="20" y1="22" x2="20" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.5"/>
              <circle cx="14" cy="28" r="1.5" fill="#F5A623" opacity="0.6"/>
              <circle cx="26" cy="28" r="1.5" fill="#F5A623" opacity="0.6"/>
              <line x1="14" y1="28" x2="26" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.4"/>
            </svg>
          </div>
          <span className="brand-name">Job<span style={{ color: "#F5A623" }}>Tracker</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <a
            className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveNav("dashboard"); window.scrollTo(0, 0); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
            Dashboard
          </a>
          <a
            className={`nav-item ${activeNav === "applications" ? "active" : ""}`}
            href="#table"
            onClick={() => { setActiveNav("applications"); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
            Applications
            <span className="nav-badge">{jobs.length}</span>
          </a>
          <div className="nav-section-label" style={{ marginTop: "1.5rem" }}>Insights</div>
          <a
            className={`nav-item ${activeNav === "analytics" ? "active" : ""}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveNav("analytics"); setSidebarOpen(false); navigate("/analytics"); }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            Analytics
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" onClick={() => { setIsFirstLogin(false); setShowProfile(true); setSidebarOpen(false); }} style={{ cursor: "pointer", flex: 1 }} title="Edit profile">
            <div className="sidebar-avatar">
              {profile?.avatarBase64 ? (
                <img src={profile.avatarBase64} alt="avatar" />
              ) : (
                <span className="sidebar-avatar-initials">
                  {profile?.username ? profile.username.slice(0, 2).toUpperCase() : profile?.email?.slice(0, 2).toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{profile?.username || "Set username"}</span>
              <span className="user-sub">{profile?.email ?? ""}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Applications</h1>
            <p className="page-subtitle">
              Track your job search · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowParse(true)}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              Parse job
            </button>
            <button className="btn-primary" onClick={() => { setCreateForm(EMPTY_FORM); setShowCreate(true); }}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add job
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, flexShrink: 0 }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
            <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
          </div>
        )}

        <div className="stats-row">
          <StatCard value={stats.total}      label="Total applied"  accent="#F5A623" />
          <StatCard value={stats.interviews} label="Interviews"     accent="#EF9F27" />
          <StatCard value={stats.offers}     label="Offers"         accent="#3DBE7A" />
          <StatCard value={`${stats.rate}%`} label="Success rate"   accent="#3DBE7A" />
        </div>

        <div className="filters-bar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            <input className="search-input" placeholder="Search company or role…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-pills">
            {(["ALL", ...STATUSES] as const).map((s) => (
              <button key={s} className={`filter-pill${filterStatus === s ? " active" : ""}`} onClick={() => setFilterStatus(s)}
                style={filterStatus === s && s !== "ALL" ? { "--pill-color": STATUS_META[s]?.color } as React.CSSProperties : {}}>
                {s === "ALL" ? "All" : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card" id="table">
          {loading ? (
            <div className="table-empty"><div className="spinner-large" /><p>Loading your applications…</p></div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="12" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="36" cy="12" r="8" fill="#F5A623"/>
                  <path d="M33 12h6M36 9v6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="empty-title">{jobs.length === 0 ? "No applications yet" : "No results found"}</p>
              <p className="empty-sub">{jobs.length === 0 ? "Start tracking your job search" : "Try adjusting your filters"}</p>
              {jobs.length === 0 && (
                <div style={{ display: "flex", gap: 10, marginTop: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                  <button className="btn-secondary" onClick={() => setShowParse(true)}>Parse job posting</button>
                  <button className="btn-primary" onClick={() => { setCreateForm(EMPTY_FORM); setShowCreate(true); }}>Add manually</button>
                </div>
              )}
            </div>
          ) : (
            <table className="jobs-table">
              <thead><tr><th>Company</th><th>Position</th><th>Status</th><th>Applied</th><th>Location</th><th>Notes</th><th></th></tr></thead>
              <tbody>
                {filtered.map((job, i) => (
                  <tr key={job.id} style={{ "--row-delay": `${i * 40}ms` } as React.CSSProperties} className="table-row">
                    <td>
                      <div className="company-cell">
                        <div className="company-avatar" style={{ "--av-color": STATUS_META[job.status]?.color || "#F5A623" } as React.CSSProperties}>
                          {job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="company-name">{job.company}</span>
                      </div>
                    </td>
                    <td className="position-cell">{job.position}</td>
                    <td><StatusBadge status={job.status as JobStatus} /></td>
                    <td className="date-cell">{new Date(job.appliedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="notes-cell">{job.location || <span className="no-notes">—</span>}</td>
                    <td className="notes-cell">{job.notes    || <span className="no-notes">—</span>}</td>
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

      {showProfile && (
        <ProfileModal
          isFirstLogin={isFirstLogin}
          onClose={() => { setShowProfile(false); setIsFirstLogin(false); }}
          onUpdated={(p) => { setProfile(p); setShowProfile(false); setIsFirstLogin(false); }}
        />
      )}
      {showParse && <Modal title="Smart job parsing" onClose={() => setShowParse(false)} wide><ParseJobModal onParsed={handleParsed} onClose={() => setShowParse(false)} /></Modal>}
      {showCreate && <Modal title="Add new application" onClose={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }}><JobForm initial={createForm} onSubmit={handleCreate} onCancel={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} loading={saving} /></Modal>}
      {editJob && <Modal title="Edit application" onClose={() => setEditJob(null)}><JobForm initial={{ company: editJob.company, position: editJob.position, status: editJob.status as JobStatus, notes: editJob.notes || "", location: editJob.location || "", salary: editJob.salary || "", contractType: editJob.contractType || "", workMode: editJob.workMode || "" }} onSubmit={handleUpdate} onCancel={() => setEditJob(null)} loading={saving} /></Modal>}
      {deleteJob && (
        <Modal title="Delete application" onClose={() => setDeleteJob(null)}>
          <div className="delete-confirm">
            <div className="delete-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <p className="delete-title">Delete <strong>{deleteJob.company}</strong>?</p>
            <p className="delete-sub">This will permanently remove the application for <em>{deleteJob.position}</em>. This action cannot be undone.</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setDeleteJob(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={saving}>{saving ? <span className="btn-spinner" /> : "Delete"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
