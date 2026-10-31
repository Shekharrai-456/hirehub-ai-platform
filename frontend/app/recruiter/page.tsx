"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { createJob, getApplicants, getCompanyJobs, updateApplicationStatus } from "@/src/lib/api";
import { useIsMounted } from "@/src/lib/useMounted";
import type { Application, Company, Job, User } from "@/src/types";

const emptyForm = {
  title: "",
  description: "",
  requirements: "",
  location: "Kathmandu",
  jobType: "full-time",
  experience: "2-4 years",
  position: "Mid Level",
  salary: "85000",
  skills: "React, Node.js, TypeScript",
  category: "Information Technology",
  deadline: "30 days remaining",
};

function readRecruiterSession(): { company: Company | null; user: User | null } {
  if (typeof window === "undefined") return { company: null, user: null };
  try {
    const savedComp = window.localStorage.getItem("hirehub-company");
    const savedUser = window.localStorage.getItem("hirehub-user");
    const u = savedUser ? (JSON.parse(savedUser) as User) : null;
    let c = savedComp ? (JSON.parse(savedComp) as Company) : null;
    if (!c && u?.role === "recruiter") {
      c = {
        _id: u._id,
        companyName: u.fullName || "Recruiter Organization",
        email: u.email,
      };
    }
    return { company: c, user: u };
  } catch {
    return { company: null, user: null };
  }
}

export default function RecruiterPage() {
  const mounted = useIsMounted();
  const session = mounted ? readRecruiterSession() : { company: null, user: null };
  const company = session.company;
  const user = session.user;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const loading = false;
  const [applicants, setApplicants] = useState<Record<string, Application[]>>({});
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!company?._id) return;
    let active = true;
    getCompanyJobs(company._id)
      .then((data) => {
        if (!active) return;
        setJobs(data);
        data.forEach((j) => {
          getApplicants(j._id).then((apps) => {
            if (active) {
              setApplicants((prev) => ({ ...prev, [j._id]: apps }));
            }
          });
        });
      })
      .catch((error) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Could not load jobs.");
        }
      });
    return () => {
      active = false;
    };
  }, [company?._id]);

  async function submitJob(event: FormEvent) {
    event.preventDefault();
    if (!company) return;
    try {
      const result = await createJob({
        ...form,
        company: company._id,
      });
      setJobs((current) => [result.job, ...current]);
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Vacancy successfully posted! It is now live in search and categories.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not post job vacancy.");
    }
  }

  async function handleStatusChange(applicationId: string, jobId: string, newStatus: Application["status"]) {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setStatusMessage(`Status updated to ${newStatus}`);
      // update state
      setApplicants((prev) => {
        const currentList = prev[jobId] || [];
        return {
          ...prev,
          [jobId]: currentList.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          ),
        };
      });
    } catch {
      setStatusMessage("Failed to update status.");
    }
  }

  if (mounted && !company && !loading && user?.role !== "recruiter") {
    return (
      <PageShell>
        <div className="empty-state">
          <h2>Employer Workspace</h2>
          <p>Please sign in with your Employer or Recruiter account to manage vacancies and candidates.</p>
          <div className="empty-state-actions">
            <Link className="primary-button" href="/login">
              Recruiter Sign In
            </Link>
            <Link className="secondary-button" href="/employer-zone">
              About Employer Zone
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const totalApplicantsCount = Object.values(applicants).reduce((sum, list) => sum + list.length, 0);
  const interviewCount = Object.values(applicants).reduce(
    (sum, list) => sum + list.filter((a) => a.status === "interview").length,
    0
  );
  const hiredCount = Object.values(applicants).reduce(
    (sum, list) => sum + list.filter((a) => a.status === "hired").length,
    0
  );

  return (
    <PageShell>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow-accent">EMPLOYER DASHBOARD</span>
          <h1>
            {company?.companyName || "Employer Workspace"} <br />
            <em>Recruitment Hub.</em>
          </h1>
          <p>Post verified job openings, monitor applicants, and manage hiring pipelines.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel / Close Form" : "Post a New Vacancy +"}
        </button>
      </section>

      {/* Metrics Row */}
      <div className="stats-row">
        <div>
          <strong>{jobs.length}</strong>
          <span>Active Vacancies</span>
        </div>
        <div>
          <strong>{totalApplicantsCount}</strong>
          <span>Total Applicants</span>
        </div>
        <div>
          <strong>{interviewCount}</strong>
          <span>Interviews Scheduled</span>
        </div>
        <div>
          <strong>{hiredCount}</strong>
          <span>Offers Extended</span>
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}
      {statusMessage && <p className="form-message">{statusMessage}</p>}

      {/* Post a Vacancy Form */}
      {showForm && (
        <form className="profile-form recruiter-form" onSubmit={submitJob}>
          <h3>Post a Verified Job Vacancy</h3>

          <div className="form-grid-2">
            <label>
              Job Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
              />
            </label>

            <label>
              Job Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Information Technology</option>
                <option>Banking &amp; Financial Services</option>
                <option>Healthcare &amp; Pharmaceuticals</option>
                <option>Advertising, Design &amp; Media</option>
                <option>Education &amp; Non-Profit</option>
                <option>Sales &amp; Business Development</option>
                <option>Telecommunications &amp; ISP</option>
              </select>
            </label>
          </div>

          <label>
            Job Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline role responsibilities, mission, and day-to-day impact..."
            />
          </label>

          <label>
            Key Requirements (comma separated)
            <input
              required
              placeholder="3+ years experience, Bachelor in CS, Proven team leadership"
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            />
          </label>

          <div className="form-grid-3">
            <label>
              Location
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Kathmandu / Lalitpur / Remote"
              />
            </label>

            <label>
              Employment Type
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </label>

            <label>
              Position Level
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              >
                <option>Entry Level</option>
                <option>Mid Level</option>
                <option>Senior Level</option>
                <option>Top Level</option>
              </select>
            </label>
          </div>

          <div className="form-grid-3">
            <label>
              Required Experience
              <input
                required
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="2-4 years"
              />
            </label>

            <label>
              Offered Monthly Salary ($)
              <input
                required
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </label>

            <label>
              Application Deadline
              <input
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                placeholder="e.g. 15 days remaining"
              />
            </label>
          </div>

          <label>
            Required Skills (comma separated)
            <input
              required
              placeholder="React, TypeScript, GraphQL, Docker"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </label>

          <button className="primary-button" type="submit">
            Publish Vacancy Now →
          </button>
        </form>
      )}

      {/* Active Jobs & Applicants Management */}
      <section className="dashboard-section">
        <div className="results-heading">
          <h2>Your Published Vacancies</h2>
          <span className="muted-text">{jobs.length} Active Postings</span>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>You have not published any job vacancies yet.</p>
            <button
              type="button"
              className="primary-button compact"
              onClick={() => setShowForm(true)}
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="application-list">
            {jobs.map((job) => {
              const jobApps = applicants[job._id] || [];
              return (
                <div key={job._id} className="recruiter-job-card-block">
                  <div className="application-row">
                    <div className="company-mark">{(job.title || "J")[0]}</div>
                    <div>
                      <strong>{job.title}</strong>
                      <p>
                        {job.location} · {job.jobType} · {job.category || "General"}
                      </p>
                    </div>
                    <span className="status green">
                      {jobApps.length} Applicants
                    </span>
                    <Link href={`/jobs/${job._id}`} className="accent-link">
                      Preview Vacancy
                    </Link>
                  </div>

                  {/* Applicants List */}
                  {jobApps.length > 0 && (
                    <div className="applicants-subtable">
                      <span className="subtable-title">Received Applications:</span>
                      {jobApps.map((app) => {
                        const applicantObj =
                          typeof app.applicant === "object" && app.applicant !== null
                            ? app.applicant
                            : { fullName: "Applicant", email: "N/A", phoneNumber: "N/A" };
                        return (
                          <div key={app._id} className="applicant-pipeline-row">
                            <div className="app-person-info">
                              <strong>{applicantObj.fullName}</strong>
                              <span>{applicantObj.email}</span>
                              {applicantObj.phoneNumber && (
                                <span className="phone-tag">{applicantObj.phoneNumber}</span>
                              )}
                            </div>

                            <div className="status-changer-box">
                              <label>Status:</label>
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    app._id,
                                    job._id,
                                    e.target.value as Application["status"]
                                  )
                                }
                                className={`status-dropdown ${app.status}`}
                              >
                                <option value="applied">Applied</option>
                                <option value="interview">Interview</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
