// src/pages/AuthPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { isAuthenticated } from "../services/auth";
import type { LoginResponse } from "../types/user.types";
import studentPhoto from "../assets/pictures/student.jpg";
import "./AuthPage.css";

// ─── Translations ─────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    tabLogin:      "Sign in",
    tabRegister:   "Create account",
    loginTitle:    "Welcome back",
    loginSub:      "Sign in to continue to your dashboard",
    registerTitle: "Create your account",
    registerSub:   "Start tracking your job applications today",
    emailLabel:    "Email address",
    passLabel:     "Password",
    passLabelNew:  "Choose a password",
    passPlaceholder: "••••••••",
    passPlaceholderNew: "Min. 6 characters",
    confirmLabel:  "Confirm password",
    confirmPlaceholder: "Repeat your password",
    loginBtn:      "Sign in",
    registerBtn:   "Create account",
    loggingIn:     "Signing in…",
    registering:   "Creating…",
    switchLogin:   "Already have an account?",
    switchRegister: "New to JobTracker?",
    switchToLogin: "Sign in",
    switchToReg:   "Create account",
    back:          "Back",
    bigTitle:      ["Track", "every", "job."],
    bigSub:        "Paste a job posting or upload a screenshot. We extract everything automatically.",
    statEn:        "English",
    statDe:        "German",
    statOcr:       "Screenshots",
    errRequired:   "Email and password are required",
    errAllRequired:"All fields are required",
    errMinPass:    "Password must be at least 6 characters",
    errPassMatch:  "Passwords do not match",
    errLogin:      "Login failed. Check your credentials.",
    errRegister:   "Registration failed",
  },
  de: {
    tabLogin:      "Anmelden",
    tabRegister:   "Konto erstellen",
    loginTitle:    "Willkommen zurück",
    loginSub:      "Melde dich an, um zu deinem Dashboard zu gelangen",
    registerTitle: "Konto erstellen",
    registerSub:   "Starte noch heute mit der Verfolgung deiner Bewerbungen",
    emailLabel:    "E-Mail-Adresse",
    passLabel:     "Passwort",
    passLabelNew:  "Passwort wählen",
    passPlaceholder: "••••••••",
    passPlaceholderNew: "Mind. 6 Zeichen",
    confirmLabel:  "Passwort bestätigen",
    confirmPlaceholder: "Passwort wiederholen",
    loginBtn:      "Anmelden",
    registerBtn:   "Konto erstellen",
    loggingIn:     "Anmeldung läuft…",
    registering:   "Konto wird erstellt…",
    switchLogin:   "Bereits ein Konto?",
    switchRegister: "Neu bei JobTracker?",
    switchToLogin: "Anmelden",
    switchToReg:   "Konto erstellen",
    back:          "Zurück",
    bigTitle:      ["Verfolge", "jeden", "Job."],
    bigSub:        "Füge eine Stellenanzeige ein oder lade einen Screenshot hoch. Wir extrahieren alles automatisch.",
    statEn:        "Englisch",
    statDe:        "Deutsch",
    statOcr:       "Screenshots",
    errRequired:   "E-Mail und Passwort sind erforderlich",
    errAllRequired:"Alle Felder sind erforderlich",
    errMinPass:    "Das Passwort muss mindestens 6 Zeichen lang sein",
    errPassMatch:  "Die Passwörter stimmen nicht überein",
    errLogin:      "Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.",
    errRegister:   "Registrierung fehlgeschlagen",
  },
};

// ─── Logo ─────────────────────────────────────────────────
function Logo() {
  return (
    <div className="auth-logo">
      <svg viewBox="0 0 40 40" fill="none" className="auth-logo-icon">
        <rect x="4" y="14" width="32" height="22" rx="4" fill="#F5A623" opacity="0.15" stroke="#F5A623" strokeWidth="1.5"/>
        <path d="M14 14V11a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="4" y1="22" x2="36" y2="22" stroke="#F5A623" strokeWidth="1" opacity="0.4"/>
        <circle cx="20" cy="22" r="2.5" fill="#F5A623"/>
        <line x1="20" y1="22" x2="20" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.5"/>
        <circle cx="14" cy="28" r="1.5" fill="#F5A623" opacity="0.6"/>
        <circle cx="26" cy="28" r="1.5" fill="#F5A623" opacity="0.6"/>
        <line x1="14" y1="28" x2="26" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.4"/>
      </svg>
      <span className="auth-logo-text">Job<span>Tracker</span></span>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
    </svg>
  );
}

// ─── Main AuthPage ────────────────────────────────────────
export default function AuthPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Read lang from localStorage — set by LandingPage
  const savedLang  = localStorage.getItem("lang") === "de" ? "de" : "en";
  const t          = TRANSLATIONS[savedLang];

  const [mode, setMode] = useState<"login" | "register">(
    location.pathname === "/register" ? "register" : "login"
  );
  const [switching, setSwitching] = useState(false);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const switchMode = (next: "login" | "register") => {
    if (next === mode || switching) return;
    setSwitching(true);
    setError("");
    setTimeout(() => {
      setMode(next);
      setEmail(""); setPassword(""); setConfirmPw("");
      setSwitching(false);
    }, 220);
  };

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email || !password) { setError(t.errRequired); return; }
    setLoading(true); setError("");
    try {
      const res = await API.post<LoginResponse>("/auth/login", { email, password });
      login(res.data.token);
      localStorage.setItem("userProfile", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || t.errLogin);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPw) { setError(t.errAllRequired); return; }
    if (password.length < 6) { setError(t.errMinPass); return; }
    if (password !== confirmPw) { setError(t.errPassMatch); return; }
    setLoading(true);
    try {
      await API.post("/users", { email, password });
      const res = await API.post<LoginResponse>("/auth/login", { email, password });
      login(res.data.token);
      localStorage.setItem("userProfile", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || t.errRegister);
    } finally { setLoading(false); }
  };

  const isRegister = mode === "register";

  return (
    <div className="auth-shell">

      {/* ── Fullscreen photo background ── */}
      <div className="auth-bg">
        <img src={studentPhoto} alt="" aria-hidden="true" />
      </div>

      {/* ── Left — giant branding ── */}
      <div className="auth-left">
        <div>
          <button className="auth-back" onClick={() => navigate("/")}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            {t.back}
          </button>
        </div>

        <div className="auth-headline-wrap">
          <Logo />
          <div style={{ height: "2rem" }} />
          <h1 className="auth-big-title">
            {t.bigTitle[0]}<br />
            {t.bigTitle[1]}<br />
            <span>{t.bigTitle[2]}</span>
          </h1>
          <p className="auth-big-sub">{t.bigSub}</p>
        </div>

        <div className="auth-stats">
          <div className="auth-stat-item">
            <span className="auth-stat-val">EN</span>
            <span className="auth-stat-lbl">{t.statEn}</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-val">DE</span>
            <span className="auth-stat-lbl">{t.statDe}</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-val">OCR</span>
            <span className="auth-stat-lbl">{t.statOcr}</span>
          </div>
        </div>
      </div>

      {/* ── Right — glass form ── */}
      <div className="auth-right">
        <div className="auth-glass">

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${!isRegister ? "active" : ""}`} onClick={() => switchMode("login")}>
              {t.tabLogin}
            </button>
            <button className={`auth-tab ${isRegister ? "active" : ""}`} onClick={() => switchMode("register")}>
              {t.tabRegister}
            </button>
            <div className="auth-tab-indicator" style={{ transform: `translateX(${isRegister ? "100%" : "0"})` }} />
          </div>

          {/* Form */}
          <div className={`auth-form-wrap ${switching ? "auth-form-wrap--out" : "auth-form-wrap--in"}`}>
            <div className="auth-form-header">
              <h2 className="auth-heading">
                {isRegister ? t.registerTitle : t.loginTitle}
              </h2>
              <p className="auth-subheading">
                {isRegister ? t.registerSub : t.loginSub}
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={isRegister ? handleRegister : handleLogin} noValidate>

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="auth-email">{t.emailLabel}</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <input id="auth-email" type="email" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email" disabled={loading} />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="auth-password">{isRegister ? t.passLabelNew : t.passLabel}</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  <input id="auth-password" type={showPw ? "text" : "password"}
                    placeholder={isRegister ? t.passPlaceholderNew : t.passPlaceholder}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    disabled={loading} />
                  <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {/* Confirm password — register only */}
              {isRegister && (
                <div className="auth-field auth-field--appear">
                  <label htmlFor="auth-confirm">{t.confirmLabel}</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                    <input id="auth-confirm" type={showPw ? "text" : "password"}
                      placeholder={t.confirmPlaceholder}
                      value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                      autoComplete="new-password" disabled={loading} />
                  </div>
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? <><span className="auth-spinner" />{isRegister ? t.registering : t.loggingIn}</>
                  : isRegister ? t.registerBtn : t.loginBtn
                }
              </button>
            </form>

            <p className="auth-switch-text">
              {isRegister ? t.switchLogin : t.switchRegister}{" "}
              <button className="auth-switch-btn" onClick={() => switchMode(isRegister ? "login" : "register")}>
                {isRegister ? t.switchToLogin : t.switchToReg}
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}