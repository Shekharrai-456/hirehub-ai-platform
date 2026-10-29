# HireHub AI Platform

HireHub is a full-stack career and recruitment platform. Candidates can discover jobs, manage their profiles, submit applications, and track application status. Companies can create job listings and review applicants, with space for future AI-powered recommendations and hiring tools.

## Project structure

```text
backend/   Express, MongoDB, authentication, jobs, companies, applications
frontend/  Next.js, React, TypeScript, candidate and recruiter interfaces
```

## Running locally

Start the backend:

```powershell
cd backend
npm install
npm run dev
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and uses the backend at `http://localhost:8000/api/v1` by default.

Create `backend/.env` locally with your MongoDB connection and secret values. Environment files are intentionally ignored by Git.
