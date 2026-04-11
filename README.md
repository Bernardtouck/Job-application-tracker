# Job Application Tracker — Smart Job Parsing (EN / DE)

A full-stack web application that helps users track their job applications and automatically extract key information from job postings written in English or German, either from text or screenshots.
Built by Bernard Touck, computer science student passionate about web development and artificial intelligence — to automate his own job search and demonstrate fullstack skills.

---

## Demo

![Dashboard Preview](assets/screenshots/demo.gif)
 
---

## Overview

Managing job applications across multiple platforms quickly becomes chaotic.
This application centralizes the process by allowing users to:
 
- Track job applications manually
- **Automatically extract structured data from job postings**
- Parse job posting screenshots via OCR
- Manage a user profile with avatar and username
- Monitor success and rejection rates in real time
 
The application follows a **client–server architecture** and REST API best practices.

---

## Key Features

- User authentication (register / login)
- Password hashing (bcrypt) 
- Manual job application tracking CRUD
- **Smart job parsing from copied job descriptions**
- **Job parsing from screenshots (OCR)**
- Automatic extraction of:
  - Job title
  - Company name
  - Contract type (Vollzeit, Teilzeit, Minijob, Praktikum, etc.)
  - Salary (hourly or yearly, if mentioned)
  - Location (city)
  - Work mode (on-site, hybrid, remote)
- Automatic application date assignment
- User-owned job applications (secure & isolated)

---

## Supported Inputs

- Copy-paste job posting text
- Screenshot image upload (PNG / JPG)

> Images are converted to text using OCR before processing.

---

## Supported Languages

- English 🇬🇧
- German 🇩🇪

> Other languages are not supported in the current version.

---

## Application Workflow

1. User registers or logs in
2. User submits:
   - a job description text  
   **or**
   - a screenshot of a job posting
3. Backend processes the input:
   - OCR (if image)
   - text analysis & extraction
4. Structured job data is generated automatically
5. User reviews and optionally edits the extracted fields
6. Job application is saved with the current date
7. User tracks application status in the dashboard

---

## Architecture

The application follows a **client–server architecture**:

- **Frontend (Client)**  
  Handles user interaction, forms, and API communication

- **Backend (Server)**  
  Exposes a REST API, applies business logic, and manages authentication

- **Database**  
  Stores users, job applications, and relationships

---

## Built Using

### Front-end

- [React](https://react.dev/) — UI framework for building interfaces
- [TypeScript](https://www.typescriptlang.org/) — Type-safe JavaScript
- [React Router](https://reactrouter.com/) — Client-side routing and navigation
- [Axios](https://axios-http.com/) — HTTP client with JWT interceptors
- [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) — Typography
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) — Dark organic amber design system

---

### Back-end

- [Node.js](https://nodejs.org/) — JavaScript runtime environment
- [Express](https://expressjs.com/) — Web framework for building REST APIs
- [TypeScript](https://www.typescriptlang.org/) — Type-safe backend
- [Prisma](https://www.prisma.io/) — ORM for type-safe database access
- [PostgreSQL](https://www.postgresql.org/) — Relational database for persistent storage
- [JWT](https://jwt.io/) — Authentication tokens (7 days expiry)
- [bcrypt](https://www.npmjs.com/package/bcrypt) — Password hashing
- [Joi](https://joi.dev/) — Request body validation
- [Multer](https://www.npmjs.com/package/multer) — File upload handling
- [Tesseract.js](https://tesseract.projectnaptha.com/) — OCR image to text (EN + DE)

---

## Project Structure
 
```
job-application-tracker/
├── client/                        # React frontend
│   └── src/
│       ├── api/                   # Axios instance, parser API, profile API
│       ├── assets/pictures/       # Local images (student photo)
│       ├── components/            # ProfileModal
│       ├── hooks/                 # useAuth
│       ├── pages/                 # LandingPage, AuthPage, Dashboard
│       ├── services/              # auth.ts (JWT decode + expiry check)
│       └── types/                 # Job, User, Parser TypeScript interfaces
│
└── server/                        # Express backend
    ├── prisma/
    │   ├── schema.prisma          # User, Job models + migrations
    │   └── migrations/
    └── src/
        ├── controllers/           # user, job, parser controllers
        ├── services/              # business logic + NLP engine + OCR
        ├── middleware/            # JWT authentication
        ├── routes/                # user, job, parser routes
        └── types/                 # Shared TypeScript types
```
 
---

## API Endpoints

```bash
# Auth & Profile
POST   /users              # Register — public
POST   /auth/login         # Login → JWT — public
GET    /users/profile      # Get profile — 🔒 JWT
PUT    /users/profile      # Update username / avatar — 🔒 JWT

# Jobs
GET    /jobs               # Get all user jobs — 🔒 JWT
POST   /jobs               # Create job — 🔒 JWT
PUT    /jobs/:id           # Update job — 🔒 JWT
DELETE /jobs/:id           # Delete job — 🔒 JWT

# Parsing
POST   /parse/text         # Parse job posting text (EN / DE) — 🔒 JWT
POST   /parse/image        # Parse screenshot via OCR — 🔒 JWT
```

---

## Getting Started
 
### Prerequisites
- Node.js 18+
- PostgreSQL
- npm
 
### Installation
 
```bash
git clone https://github.com/Bernardtouck/job-application-tracker.git
cd job-application-tracker
 
cd server && npm install
cd ../client && npm install
```
 
### Environment variables
 
Create `server/.env`:
 
```env
DATABASE_URL="postgresql://user:password@localhost:5432/job_tracker_db"
JWT_SECRET="your-secret-key"
PORT=3000
```
 
Create `client/.env`:
 
```env
VITE_API_URL=http://localhost:3000
```
 
### Database setup
 
```bash
cd server
npx prisma migrate dev
npx prisma generate
```
 
### Run
 
```bash
# Terminal 1
cd server && npm run dev
 
# Terminal 2
cd client && npm run dev
```
 
Open [http://localhost:5173](http://localhost:5173)
 
---
 
## What I learned building this
 
- Layered REST API architecture — controllers → services → Prisma
- JWT authentication with client-side expiry detection
- Building a multi-layer NLP extraction engine without external AI APIs
- Tesseract OCR integration with EN+DE language models and artifact cleaning
- PostgreSQL + Prisma ORM with migrations
- React fullstack with TypeScript end-to-end
- Cohesive design system across multiple pages
 
---
 
## Roadmap
 
- [ ] Deploy frontend (Vercel) + backend (Railway)
- [ ] Improve DE city detection in OCR mode
- [ ] Export applications to CSV
- [ ] Email reminders for interview dates
- [ ] Pagination on the jobs table
 
---
 
## License
 
MIT — Bernard Touck © 2026