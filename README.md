# Job Application Tracker

A full-stack web application for tracking and managing job applications in one place.
Built to demonstrate clean architecture, authentication, and real-world CRUD workflows.

---

## Demo

🚧 *Demo will be added once the frontend is implemented.*

---

## Built Using

### Frontend
- [React](https://react.dev/) - Frontend framework
- [React Hooks](https://react.dev/reference/react) - State management (useState, props)
- [React Router](https://reactrouter.com/) - Routing & navigation
- [Semantic UI](https://semantic-ui.com/) - UI component library
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - Custom styling
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Toast notifications

### Backend
- [Node.js](https://nodejs.org/) - Runtime environment for JavaScript
- [Express](https://expressjs.com/) - Web framework for building REST APIs
- [PostgreSQL](https://www.postgresql.org/) - Relational database system
- [Prisma](https://www.prisma.io/) - ORM for database modeling and queries
- [JSON Web Token (JWT)](https://jwt.io/) - Authentication and authorization
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Password hashing
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable management


### Database

* PostgreSQL

---

## Features

### Authentication

* User registration
* User login
* Password hashing
* JWT-based authentication
* Protected API routes

### Job Application Management

* Create job applications
* Update application status
* Delete applications
* Track company, position, status, notes, and dates

### Architecture

* Client–server separation
* RESTful API
* Modular backend structure
* Database abstraction with Prisma

---

## Project Structure

```text
job-application-tracker/
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
├── .env.example
└── .gitignore
```

---

## Database Design

* One **User** can have many **Job Applications**
* Each **Job Application** belongs to exactly one **User**

---

## API Endpoints (Planned)

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Jobs (Protected)

* `GET /api/jobs`
* `POST /api/jobs`
* `PUT /api/jobs/:id`
* `DELETE /api/jobs/:id`

---

## Installation

### Prerequisites

* Node.js
* PostgreSQL

### Setup

```bash
git clone https://github.com/your-username/job-application-tracker.git
cd job-application-tracker/server
npm install
```

---

## Environment Variables

Create a `.env` file based on `.env.example`.

---

## License

This project is intended for educational and portfolio purposes.
