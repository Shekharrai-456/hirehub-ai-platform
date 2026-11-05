"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
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
  const [applicants, setApplicants] = useState<Record<string, Application[]>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"jobs" | "applicants">("jobs");

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

  if (mounted && !company && user?.role !== "recruiter") {
    return (
      <PageShell>
        <div className="empty-state" style={{ margin: "40px 0" }}>
          <Icon name="building" size={40} />
          <h2>Employer Workspace Access</h2>
          <p>Please sign in with your Employer or Recruiter account to manage vacancies and candidates.</p>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
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
      <div className="recruiter-workspace-layout">
        {/* Workspace Banner */}
        <section className="recruiter-hero-banner">
          <div>
            <span className="eyebrow-accent" style={{ color: "var(--lime)" }}>
              EMPLOYER WORKSPACE
            </span>
            <h1>{company?.companyName || "Recruiter Dashboard"}</h1>
            <p>Manage active job vacancies, track candidate applications, and schedule interviews.</p>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            <Icon name="briefcase" size={16} />
            <span>Post a New Vacancy</span>
          </button>
        </section>

        {/* SaaS KPI Ribbon */}
        <div className="kpi-ribbon-grid">
          <div className="kpi-stat-card">
            <div className="kpi-icon-box">
              <Icon name="briefcase" size={22} />
            </div>
            <div>
              <span className="kpi-stat-label">Active Vacancies</span>
              <strong className="kpi-stat-number">{jobs.length}</strong>
            </div>
          </div>

          <div className="kpi-stat-card">
            <div className="kpi-icon-box">
              <Icon name="user" size={22} />
            </div>
            <div>
              <span className="kpi-stat-label">Total Applicants</span>
              <strong className="kpi-stat-number">{totalApplicantsCount}</strong>
            </div>
          </div>

          <div className="kpi-stat-card">
            <div className="kpi-icon-box" style={{ background: "#fef3c7", color: "#b45309" }}>
              <Icon name="clock" size={22} />
            </div>
            <div>
              <span className="kpi-stat-label">Interviews</span>
              <strong className="kpi-stat-number">{interviewCount}</strong>
            </div>
          </div>

          <div className="kpi-stat-card">
            <div className="kpi-icon-box" style={{ background: "#dcfce7", color: "#15803d" }}>
              <Icon name="badgeCheck" size={22} />
            </div>
            <div>
              <span className="kpi-stat-label">Offers Extended</span>
              <strong className="kpi-stat-number">{hiredCount}</strong>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="jobseeker-tab-bar">
          <button
            type="button"
            className={`js-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            <Icon name="briefcase" size={16} />
            <span>Published Vacancies ({jobs.length})</span>
          </button>
          <button
            type="button"
            className={`js-tab-btn ${activeTab === "applicants" ? "active" : ""}`}
            onClick={() => setActiveTab("applicants")}
          >
            <Icon name="user" size={16} />
            <span>Candidate Pipeline ({totalApplicantsCount})</span>
          </button>
        </div>

        {/* Published Vacancies View */}
        {activeTab === "jobs" && (
          <div>
            {jobs.length === 0 ? (
              <div className="empty-state">
                <Icon name="briefcase" size={32} />
                <strong>No vacancies published yet</strong>
                <p>Post your first job vacancy to start receiving verified applications from Nepali talent.</p>
                <button
                  type="button"
                  className="primary-button compact"
                  onClick={() => setShowForm(true)}
                >
                  Create Vacancy Post
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {jobs.map((job) => {
                  const jobApps = applicants[job._id] || [];
                  return (
                    <div
                      key={job._id}
                      style={{
                        background: "var(--white)",
                        border: "1px solid var(--line)",
                        borderRadius: "var(--radius-lg)",
                        padding: "24px",
                        boxShadow: "var(--shadow-xs)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div className="company-mark">{(job.title || "J").slice(0, 1)}</div>
                          <div>
                            <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 4px", color: "var(--ink)" }}>
                              {job.title}
                            </h3>
                            <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                              {job.location} • <span className="capitalize">{job.jobType}</span> • {job.category || "Information Technology"}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span className="filter-chip" style={{ background: "var(--mint)", color: "var(--green)" }}>
                            {jobApps.length} Applicants
                          </span>
                          <Link href={`/jobs/${job._id}`} className="card-view-btn">
                            Preview Vacancy <Icon name="external" size={13} />
                          </Link>
                        </div>
                      </div>

                      {jobApps.length > 0 && (
                        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--line-subtle)" }}>
                          <h4 style={{ fontSize: "13.5px", fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" }}>
                            Recent Applicants ({jobApps.length}):
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {jobApps.map((app) => {
                              const applicantObj =
                                typeof app.applicant === "object" && app.applicant !== null
                                  ? app.applicant
                                  : { fullName: "Candidate", email: "N/A", phoneNumber: "N/A" };
                              return (
                                <div key={app._id} className="applicant-card">
                                  <div className="applicant-info-block">
                                    <div className="applicant-avatar">
                                      {(applicantObj.fullName || "C").slice(0, 1)}
                                    </div>
                                    <div>
                                      <h4 className="applicant-name">{applicantObj.fullName}</h4>
                                      <div className="applicant-subline">
                                        <span>{applicantObj.email}</span>
                                        {applicantObj.phoneNumber && (
                                          <span>• {applicantObj.phoneNumber}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--muted)" }}>Status:</label>
                                    <select
                                      value={app.status}
                                      onChange={(e) =>
                                        handleStatusChange(
                                          app._id,
                                          job._id,
                                          e.target.value as Application["status"]
                                        )
                                      }
                                      className="sort-select"
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Candidate Pipeline View */}
        {activeTab === "applicants" && (
          <div>
            {totalApplicantsCount === 0 ? (
              <div className="empty-state">
                <Icon name="user" size={32} />
                <strong>No applicants in pipeline yet</strong>
                <p>When candidates apply to your published roles, they will appear here with full profile details.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(applicants).flatMap(([jobId, apps]) =>
                  apps.map((app) => {
                    const matchedJob = jobs.find((j) => j._id === jobId);
                    const applicantObj =
                      typeof app.applicant === "object" && app.applicant !== null
                        ? app.applicant
                        : { fullName: "Applicant", email: "N/A", phoneNumber: "N/A" };
                    return (
                      <div key={app._id} className="applicant-card">
                        <div className="applicant-info-block">
                          <div className="applicant-avatar">
                            {(applicantObj.fullName || "A").slice(0, 1)}
                          </div>
                          <div>
                            <h4 className="applicant-name">{applicantObj.fullName}</h4>
                            <div className="applicant-subline">
                              <span>Applied for: <strong>{matchedJob?.title || "Vacancy"}</strong></span>
                              <span>• {applicantObj.email}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className={`status-badge ${app.status}`}>{app.status}</span>
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app._id, jobId, e.target.value as Application["status"])
                            }
                            className="sort-select"
                          >
                            <option value="applied">Applied</option>
                            <option value="interview">Interview</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Dialog for Posting a Vacancy */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <div>
                  <span className="eyebrow-accent">NEW POSTING</span>
                  <h2>Publish a Job Vacancy</h2>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowForm(false)}
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={submitJob} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="job-form-grid">
                  <div className="form-field-group">
                    <label>Job Title</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Senior Backend Engineer"
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Category</label>
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
                  </div>

                  <div className="form-field-group full-span">
                    <label>Job Description</label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the mission, day-to-day work, and impact..."
                    />
                  </div>

                  <div className="form-field-group full-span">
                    <label>Key Requirements (comma separated)</label>
                    <input
                      required
                      value={form.requirements}
                      onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                      placeholder="3+ years React, Bachelor in CS, Strong system architecture"
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Location</label>
                    <input
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Kathmandu / Lalitpur / Remote"
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Employment Type</label>
                    <select
                      value={form.jobType}
                      onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>Offered Monthly Salary (Rs.)</label>
                    <input
                      required
                      type="number"
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Application Deadline</label>
                    <input
                      required
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      placeholder="e.g. 25 days remaining"
                    />
                  </div>

                  <div className="form-field-group full-span">
                    <label>Required Skills (comma separated)</label>
                    <input
                      required
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="Node.js, MongoDB, TypeScript, REST API"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">
                    Publish Vacancy Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {(message || statusMessage) && (
          <button
            className="toast"
            onClick={() => {
              setMessage("");
              setStatusMessage("");
            }}
          >
            {message || statusMessage} <Icon name="close" size={14} />
          </button>
        )}
      </div>
    </PageShell>
  );
}
