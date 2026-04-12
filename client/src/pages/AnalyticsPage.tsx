// src/pages/AnalyticsPage.tsx
// Full analytics page — dark amber design
// Animated company logos in arc, charts, heatmap

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import type { Job } from "../types/job.types";
import type { UserProfile } from "../types/user.types";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import "./AnalyticsPage.css";

// ─── Company logos (SVG paths) ────────────────────────
const COMPANIES = [
  {
    name: "Google",
    color: "#4285F4",
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    name: "Microsoft",
    color: "#00A4EF",
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
      </svg>
    ),
  },
  {
    name: "Amazon",
    color: "#FF9900",
    svg: (
      <svg viewBox="0 0 24 24" fill="#FF9900">
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.075-1.052-.872-1.238-1.276-1.814-2.106-1.734 1.768-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.097v-.41c0-.753.06-1.642-.384-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.547.582l-3.065-.333c-.259-.058-.548-.266-.472-.66C6.014 2.088 9.098 1 11.88 1c1.425 0 3.286.379 4.409 1.459 1.425 1.332 1.289 3.112 1.289 5.044v4.568c0 1.373.57 1.975 1.107 2.717.188.264.229.58-.012.777l-1.529 1.23zm3.271 2.818C18.306 22.281 14.993 24 12.077 24c-3.869 0-7.358-1.432-9.996-3.818-.207-.187-.022-.443.226-.298 2.847 1.658 6.366 2.656 10.003 2.656 2.452 0 5.151-.508 7.631-1.564.374-.16.69.247.314.537z" />
      </svg>
    ),
  },
  {
    name: "Meta",
    color: "#0668E1",
    svg: (
      <svg viewBox="0 0 24 24" fill="#0668E1">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.013 3.693 9.153 8.505 9.876V14.65H8.031v-2.629h2.474v-1.749c0-2.896 1.411-4.167 3.818-4.167 1.153 0 1.762.085 2.051.124v2.294h-1.642c-1.022 0-1.379.969-1.379 2.061v1.437h2.995l-.406 2.629h-2.588v7.247C18.235 21.236 22 17.062 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    color: "#635BFF",
    svg: (
      <svg viewBox="0 0 24 24" fill="#635BFF">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    color: "#fff",
    svg: (
      <svg viewBox="0 0 24 24" fill="white">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    svg: (
      <svg viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "SAP",
    color: "#009FDB",
    svg: (
      <svg viewBox="0 0 24 24" fill="#009FDB">
        <path d="M0 0v24h24V0zm14.254 5.28l3.324 8.73h-2.41l-.56-1.57h-3.11l-.55 1.57H8.56l3.35-8.73zm-1.62 2.55l-1.02 2.9h2.04zm-7.76-.28c1.25 0 2.26.39 2.91 1.09l-1.37 1.2c-.34-.38-.84-.6-1.48-.6-.97 0-1.61.59-1.61 1.53 0 .94.65 1.53 1.63 1.53.56 0 1.04-.19 1.37-.53v-.5H5.19V9.7h3.17v2.99c-.74.79-1.83 1.26-3.17 1.26C3.1 13.95 1.5 12.6 1.5 10.75c0-1.86 1.6-3.2 3.37-3.2zm13.9 5.47c.53 0 1 .18 1.35.49l-1 1.07c-.1-.11-.21-.17-.34-.17-.26 0-.43.17-.43.43 0 .44.49.67.98 1.05.57.44.98.99.98 1.77 0 1.07-.77 1.8-1.89 1.8-.67 0-1.28-.22-1.71-.62l.96-1.11c.16.16.39.27.64.27.31 0 .52-.18.52-.46 0-.49-.57-.75-1.1-1.16-.51-.39-.86-.91-.86-1.63 0-1.01.72-1.73 1.9-1.73z" />
      </svg>
    ),
  },
];

// ─── Animated Logo Arc ────────────────────────────────
function LogoArc({ centerPhoto }: { centerPhoto: string }) {
  const total = COMPANIES.length;
  const radius = 160;
  const cx = 220;
  const cy = 220;

  return (
    <div className="arc-container">
      {/* Decorative rings */}
      <div className="arc-ring arc-ring-1" />
      <div className="arc-ring arc-ring-2" />
      <div className="arc-ring arc-ring-3" />

      {/* Center photo */}
      <div className="arc-center">
        <img src={centerPhoto} alt="Professional" className="arc-photo" />
        <div className="arc-center-glow" />
      </div>

      {/* Orbiting logos */}
      {COMPANIES.map((company, i) => {
        const angle = (i / total) * 360 - 90; // start from top
        const rad = (angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);
        const delay = i * 0.4;

        return (
          <div
            key={company.name}
            className="arc-logo"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              animationDelay: `${delay}s`,
              "--logo-color": company.color,
            } as React.CSSProperties}
            title={company.name}
          >
            {company.svg}
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────
function StatChip({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="stat-chip">
      <span className="stat-chip-val" style={{ color }}>{value}</span>
      <span className="stat-chip-lbl">{label}</span>
    </div>
  );
}

// ─── Main AnalyticsPage ───────────────────────────────
export default function AnalyticsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile] = useState<UserProfile | null>(() => {
    try { return JSON.parse(localStorage.getItem("userProfile") || "null"); }
    catch { return null; }
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── Computed stats ──
  const total = jobs.length;
  const offers = jobs.filter((j) => j.status === "OFFER").length;
  const rejected = jobs.filter((j) => j.status === "REJECTED").length;
  const interviews = jobs.filter((j) => j.status === "INTERVIEW").length;
  const decided = offers + rejected;
  const successRate = decided > 0 ? Math.round((offers / decided) * 100) : 0;
  const responseRate = total > 0 ? Math.round(((offers + rejected + interviews) / total) * 100) : 0;

  // Donut data
  const donutData = [
    { name: "Applied", value: jobs.filter((j) => j.status === "APPLIED").length, color: "#5B8FD4" },
    { name: "Interview", value: interviews, color: "#EF9F27" },
    { name: "Offer", value: offers, color: "#3DBE7A" },
    { name: "Rejected", value: rejected, color: "#E24B4A" },
  ].filter((d) => d.value > 0);

  // Monthly bar data
  const monthMap: Record<string, number> = {};
  jobs.forEach((j) => {
    const key = new Date(j.appliedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthMap[key] = (monthMap[key] || 0) + 1;
  });
  const barData = Object.entries(monthMap).map(([month, count]) => ({ month, count })).slice(-8);

  // Day of week heatmap
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCount: number[] = Array(7).fill(0);
  jobs.forEach((j) => {
    const d = new Date(j.appliedAt).getDay(); // 0=Sun
    const idx = d === 0 ? 6 : d - 1; // shift so Mon=0
    dayCount[idx]++;
  });
  const maxDay = Math.max(...dayCount, 1);

  // Response rate line (cumulative)
  const sorted = [...jobs].sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());
  const lineData = sorted.map((_, i) => {
    const slice = sorted.slice(0, i + 1);
    const responded = slice.filter((j) => j.status !== "APPLIED").length;
    return {
      i: i + 1,
      rate: Math.round((responded / (i + 1)) * 100),
    };
  });

  const handleLogout = () => { logout(); localStorage.removeItem("userProfile"); navigate("/"); };

  const CENTER_PHOTO = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&fit=crop&crop=face";

  const tooltipStyle = {
    background: "#1a1610",
    border: "1px solid rgba(245,166,35,0.2)",
    borderRadius: 8,
    fontSize: 12,
    color: "#F2EDE4",
  };

  return (
    <div className="ap-shell">
      {/* ── Sidebar ── */}
      <aside className="ap-sidebar">
        <div className="ap-brand">
          <svg viewBox="0 0 40 40" fill="none" style={{ width: 32, height: 32, flexShrink: 0 }}>
            <rect x="4" y="14" width="32" height="22" rx="4" fill="#F5A623" opacity="0.15" stroke="#F5A623" strokeWidth="1.5" />
            <path d="M14 14V11a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4" y1="22" x2="36" y2="22" stroke="#F5A623" strokeWidth="1" opacity="0.4" />
            <circle cx="20" cy="22" r="2.5" fill="#F5A623" />
            <line x1="20" y1="22" x2="20" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.5" />
            <circle cx="14" cy="28" r="1.5" fill="#F5A623" opacity="0.6" />
            <circle cx="26" cy="28" r="1.5" fill="#F5A623" opacity="0.6" />
            <line x1="14" y1="28" x2="26" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.4" />
          </svg>
          <span className="ap-brand-name">Job<span>Tracker</span></span>
        </div>

        <nav className="ap-nav">
          <div className="ap-nav-section">Main</div>
          <a className="ap-nav-item" onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }} href="#">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
            Dashboard
          </a>
          <a className="ap-nav-item" onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }} href="#">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
            Applications
          </a>
          <div className="ap-nav-section" style={{ marginTop: "1.5rem" }}>Insights</div>
          <a className="ap-nav-item active" href="#">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            Analytics
          </a>
        </nav>

        <div className="ap-sidebar-footer">
          <div className="ap-user">
            <div className="ap-avatar">
              {profile?.avatarBase64
                ? <img src={profile.avatarBase64} alt="avatar" />
                : <span>{profile?.username?.slice(0, 2).toUpperCase() ?? "?"}</span>
              }
            </div>
            <div className="ap-user-info">
              <span className="ap-user-name">{profile?.username || "User"}</span>
              <span className="ap-user-email">{profile?.email ?? ""}</span>
            </div>
          </div>
          <button className="ap-logout" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ap-main">

        {/* Hero section */}
        <section className="ap-hero">
          <div className="ap-hero-left">
            <div className="ap-hero-badge">Your job hunt in numbers</div>
            <h1 className="ap-hero-title">
              Analytics<br />
              <span>Dashboard</span>
            </h1>
            <p className="ap-hero-sub">
              Track your progress, spot patterns,<br />
              and optimize your job search strategy.
            </p>
            <div className="ap-hero-chips">
              <StatChip value={total} label="Applications" color="#F5A623" />
              <StatChip value={`${successRate}%`} label="Success rate" color="#3DBE7A" />
              <StatChip value={`${responseRate}%`} label="Response rate" color="#5B8FD4" />
              <StatChip value={interviews} label="Interviews" color="#EF9F27" />
            </div>
          </div>

          <div className="ap-hero-right">
            <LogoArc centerPhoto={CENTER_PHOTO} />
          </div>
        </section>

        {/* Charts grid */}
        {loading ? (
          <div className="ap-loading"><div className="ap-spinner" /><p>Loading your data…</p></div>
        ) : total === 0 ? (
          <div className="ap-empty">
            <p>No applications yet — start tracking to see analytics.</p>
            <button className="ap-btn" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          </div>
        ) : (
          <div className="ap-charts">

            {/* Row 1: Donut + Monthly bar */}
            <div className="ap-chart-card ap-chart-card--sm">
              <div className="ap-chart-title">Status breakdown</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.9} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="ap-legend">
                {donutData.map((d) => (
                  <div key={d.name} className="ap-legend-item">
                    <div className="ap-legend-dot" style={{ background: d.color }} />
                    <span>{d.name}</span>
                    <span className="ap-legend-count">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ap-chart-card ap-chart-card--lg">
              <div className="ap-chart-title">Applications per month</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barSize={32} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#4A4236", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4A4236", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(245,166,35,0.05)" }} formatter={(v: any) => [v, "Applications"]} />
                  <Bar dataKey="count" fill="#F5A623" radius={[5, 5, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Row 2: Response rate line + Day heatmap */}
            <div className="ap-chart-card ap-chart-card--lg">
              <div className="ap-chart-title">Cumulative response rate</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.06)" vertical={false} />
                  <XAxis dataKey="i" tick={{ fill: "#4A4236", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Applications", position: "insideBottom", offset: -2, fill: "#4A4236", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#4A4236", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Response rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="#3DBE7A" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#3DBE7A" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="ap-chart-card ap-chart-card--sm">
              <div className="ap-chart-title">Applications by day of week</div>
              <div className="ap-heatmap">
                {DAYS.map((day, i) => {
                  const count = dayCount[i];
                  const intensity = count / maxDay;
                  return (
                    <div key={day} className="ap-heatmap-row">
                      <span className="ap-heatmap-day">{day}</span>
                      <div className="ap-heatmap-bar-wrap">
                        <div
                          className="ap-heatmap-bar"
                          style={{ width: `${intensity * 100}%`, opacity: 0.3 + intensity * 0.7 }}
                        />
                      </div>
                      <span className="ap-heatmap-count">{count}</span>
                    </div>
                  );
                })}
              </div>
              <p className="ap-heatmap-hint">Best day to apply: <strong>{DAYS[dayCount.indexOf(Math.max(...dayCount))]}</strong></p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}