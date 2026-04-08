// src/pages/LandingPage.tsx
// Bilingual landing page EN ↔ DE with 3D card flip transition
// Design: Organic dark with warm amber accents, Bricolage Grotesque + DM Sans

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

// ─── Content ─────────────────────────────────────────────
const CONTENT = {
  en: {
    lang: "EN",
    other: "DE",
    badge: "Built by a developer, for developers",
    headline: ["Your job search,", "finally", "under control."],
    sub: "Paste a job posting or upload a screenshot — JobTracker extracts company, salary, location and contract type automatically. Built to automate my own job hunt.",
    cta: "Get started — it's free",
    login: "Already have an account? Sign in",
    features: [
      { icon: "⚡", title: "Smart parsing", desc: "Paste any job description and watch the fields fill themselves." },
      { icon: "📸", title: "OCR screenshots", desc: "Upload a job posting image. We extract everything via Tesseract." },
      { icon: "🇩🇪 🇬🇧", title: "EN & DE support", desc: "Understands English and German job postings natively." },
    ],
    about: "Hi, I'm",
    name: "Bernard Touck",
    role: "Computer Science Student · Web Dev & AI Enthusiast",
    story: "I built JobTracker because tracking job applications across 5 different platforms in spreadsheets was chaos. As a passionate developer always chasing new discoveries in web development and artificial intelligence, I wanted a smarter tool — so I built one. It's my most complete fullstack project to date.",
    stack: "React · TypeScript · Node.js · Express · Prisma · PostgreSQL · Tesseract OCR",
  },
  de: {
    lang: "DE",
    other: "EN",
    badge: "Von einem Entwickler, für Entwickler",
    headline: ["Deine Jobsuche,", "endlich", "unter Kontrolle."],
    sub: "Füge eine Stellenanzeige ein oder lade einen Screenshot hoch — JobTracker extrahiert automatisch Unternehmen, Gehalt, Standort und Vertragsart. Entwickelt, um meine eigene Jobsuche zu automatisieren.",
    cta: "Jetzt starten — kostenlos",
    login: "Bereits ein Konto? Anmelden",
    features: [
      { icon: "⚡", title: "Intelligentes Parsing", desc: "Füge eine Stellenbeschreibung ein und sieh, wie sich die Felder automatisch füllen." },
      { icon: "📸", title: "OCR-Screenshots", desc: "Lade ein Bild einer Stellenanzeige hoch. Wir extrahieren alles via Tesseract." },
      { icon: "🇩🇪 🇬🇧", title: "EN & DE Unterstützung", desc: "Versteht englische und deutsche Stellenanzeigen von Natur aus." },
    ],
    about: "Hallo, ich bin",
    name: "Bernard Touck",
    role: "Informatikstudent · Web-Entwicklung & KI-Enthusiast",
    story: "Ich habe JobTracker entwickelt, weil das Verwalten von Bewerbungen über 5 verschiedene Plattformen in Tabellenkalkulationen chaotisch war. Als leidenschaftlicher Entwickler, der immer neuen Entdeckungen in der Webentwicklung und künstlichen Intelligenz nachjagt, wollte ich ein intelligenteres Tool — also habe ich eines gebaut. Es ist mein bisher umfangreichstes Fullstack-Projekt.",
    stack: "React · TypeScript · Node.js · Express · Prisma · PostgreSQL · Tesseract OCR",
  },
};

// ─── Logo SVG ─────────────────────────────────────────────
function Logo() {
  return (
    <div className="lp-logo">
      <svg viewBox="0 0 40 40" fill="none" className="lp-logo-icon">
        {/* Briefcase shape */}
        <rect x="4" y="14" width="32" height="22" rx="4" fill="#F5A623" opacity="0.15" stroke="#F5A623" strokeWidth="1.5"/>
        <path d="M14 14V11a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Circuit lines — tech element */}
        <line x1="4" y1="22" x2="36" y2="22" stroke="#F5A623" strokeWidth="1" opacity="0.4"/>
        <circle cx="20" cy="22" r="2.5" fill="#F5A623"/>
        <line x1="20" y1="22" x2="20" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.5"/>
        <circle cx="14" cy="28" r="1.5" fill="#F5A623" opacity="0.6"/>
        <circle cx="26" cy="28" r="1.5" fill="#F5A623" opacity="0.6"/>
        <line x1="14" y1="28" x2="26" y2="28" stroke="#F5A623" strokeWidth="1" opacity="0.4"/>
      </svg>
      <span className="lp-logo-text">Job<span>Tracker</span></span>
    </div>
  );
}

// ─── Floating orbs background ────────────────────────────
function Orbs() {
  return (
    <div className="lp-orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

// ─── Card side (EN or DE) ────────────────────────────────
function CardSide({ content, onFlip, onLogin, onRegister }: {
  content: typeof CONTENT.en;
  onFlip: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="lp-card-side">
      <Orbs />

      {/* Nav */}
      <nav className="lp-nav">
        <Logo />
        <div className="lp-nav-right">
          <button className="lp-lang-btn" onClick={onFlip}>
            <span className="lang-globe">🌐</span>
            {content.other}
            <span className="lang-flip-hint">↺</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <div className="lp-badge">{content.badge}</div>

          <h1 className="lp-headline">
            {content.headline.map((line, i) => (
              <span key={i} className={i === 1 ? "headline-accent" : ""} style={{ animationDelay: `${i * 0.12}s` }}>
                {line}
              </span>
            ))}
          </h1>

          <p className="lp-sub">{content.sub}</p>

          <div className="lp-cta-group">
            <button className="lp-cta-primary" onClick={onRegister}>
              {content.cta}
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            <button className="lp-cta-secondary" onClick={onLogin}>{content.login}</button>
          </div>
        </div>

        {/* Illustration */}
        <div className="lp-hero-right">
          <div className="lp-dashboard-preview">
            <div className="preview-bar">
              <span /><span /><span />
            </div>
            <div className="preview-content">
              <div className="preview-stat"><div className="stat-num">24</div><div className="stat-lbl">Applied</div></div>
              <div className="preview-stat accent"><div className="stat-num">8</div><div className="stat-lbl">Interviews</div></div>
              <div className="preview-stat success"><div className="stat-num">2</div><div className="stat-lbl">Offers</div></div>
            </div>
            <div className="preview-row"><div className="preview-tag">Stripe</div><div className="preview-badge applied">Applied</div></div>
            <div className="preview-row"><div className="preview-tag">Vercel</div><div className="preview-badge interview">Interview</div></div>
            <div className="preview-row"><div className="preview-tag">Linear</div><div className="preview-badge offer">Offer ✓</div></div>
            <div className="preview-parse">
              <span className="parse-icon">⚡</span>
              <span>Smart parsing active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-features">
        {content.features.map((f) => (
          <div key={f.title} className="lp-feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="lp-about">
        <div className="lp-about-avatar">BT</div>
        <div className="lp-about-content">
          <p className="about-greeting">{content.about} <strong>{content.name}</strong></p>
          <p className="about-role">{content.role}</p>
          <p className="about-story">{content.story}</p>
          <div className="about-stack">{content.stack}</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <span>© 2026 Bernard Touck</span>
        <span>·</span>
        <span>Built with React, Node.js & ❤️</span>
      </footer>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang]       = useState<"en" | "de">("en");
  const [flipping, setFlipping] = useState(false);
  const [showBack, setShowBack] = useState(false);

  const handleFlip = () => {
    if (flipping) return;
    setFlipping(true);
    // At halfway point, swap content
    setTimeout(() => {
      setLang((l) => l === "en" ? "de" : "en");
      setShowBack((v) => !v);
    }, 350);
    setTimeout(() => setFlipping(false), 700);
  };

  const content = CONTENT[lang];

  return (
    <div className="lp-scene">
      <div className={`lp-card ${flipping ? "lp-card--flipping" : ""} ${showBack ? "lp-card--flipped" : ""}`}>
        <div className="lp-card-front">
          <CardSide
            content={content}
            onFlip={handleFlip}
            onLogin={() => navigate("/")}
            onRegister={() => navigate("/register")}
          />
        </div>
        <div className="lp-card-back">
          <CardSide
            content={content}
            onFlip={handleFlip}
            onLogin={() => navigate("/")}
            onRegister={() => navigate("/register")}
          />
        </div>
      </div>
    </div>
  );
}