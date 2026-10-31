"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { getApplications, getSavedJobs, toggleBookmark, withdrawApplication } from "@/src/lib/api";
import { useIsMounted } from "@/src/lib/useMounted";
import type { Application, Job, User } from "@/src/types";

function readUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem("hirehub-user");
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const mounted = useIsMounted();
  const user = mounted ? readUser() : null;

  const [activeTab, setActiveTab] = useState<"applications" | "saved">("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [loadedApps, setLoadedApps] = useState(false);
  const [loadedSaved, setLoadedSaved] = useState(false);

  // Withdrawal state
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load applications
  useEffect(() => {
    if (!user?._id) return;
    let active = true;
    getApplications(user._id)
      .then((data) => {
        if (active) {
          setApplications(data);
          setLoadedApps(true);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not load applications.");
          setLoadedApps(true);
        }
      });
    return () => {
      active = false;
    };
  }, [user?._id]);

  // Load saved jobs
  useEffect(() => {
    if (!user?._id) return;
    let active = true;
    getSavedJobs()
      .then((data) => {
        if (active) {
          setSavedJobs(data);
          setLoadedSaved(true);
        }
      })
      .catch(() => {
        if (active) setLoadedSaved(true);
      });
    return () => {
      active = false;
    };
  }, [user?._id]);

  async function handleWithdraw(applicationId: string) {
    setWithdrawingId(applicationId);
    setFeedbackNotice(null);
    try {
      await withdrawApplication(applicationId);
      setApplications((prev) => prev.filter((a) => a._id !== applicationId));
      setFeedbackNotice({
        type: "success",
        text: "Your application has been safely withdrawn.",
      });
      setConfirmWithdrawId(null);
    } catch (err) {
      setFeedbackNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Could not withdraw application.",
      });
    } finally {
      setWithdrawingId(null);
    }
  }

  async function handleRemoveSaved(jobId: string) {
    try {
      const res = await toggleBookmark(jobId);
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
      // update local storage
      const stored = window.localStorage.getItem("hirehub-user");
      if (stored) {
        const u = JSON.parse(stored) as User;
        u.savedJobs = res.savedJobs;
        window.localStorage.setItem("hirehub-user", JSON.stringify(u));
      }
    } catch {
      // ignore
    }
  }

  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;

  return (
    <PageShell>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow-accent">CANDIDATE DASHBOARD</span>
          <h1>
            {mounted && user ? `Welcome back, ${user.fullName.split(" ")[0]}.` : "Candidate Portal"}
          </h1>
          <p>Track your submitted applications, interview stages, and saved job vacancies.</p>
        </div>
        <div className="dashboard-heading-buttons">
          <Link className="secondary-button" href="/profile">
            Edit Profile &amp; CV ⚙
          </Link>
          <Link className="primary-button" href="/jobs">
            Explore Vacancies →
          </Link>
        </div>
      </section>

      {mounted && !user && (
        <div className="empty-state">
          <h2>Sign in Required</h2>
          <p>Please sign in to track your job applications and saved vacancies.</p>
          <Link className="primary-button compact" href="/login">
            Sign In to Account
          </Link>
        </div>
      )}

      {mounted && user && (
        <>
          <div className="stats-row">
            <div>
              <strong>{applications.length}</strong>
              <span>Applications Submitted</span>
            </div>
            <div>
              <strong>{savedJobs.length}</strong>
              <span>Saved Vacancies</span>
            </div>
            <div>
              <strong>{interviewCount}</strong>
              <span>Interview Invitations</span>
            </div>
            <div>
              <strong>{hiredCount}</strong>
              <span>Job Offers</span>
            </div>
          </div>

          {feedbackNotice && (
            <div className={`form-alert ${feedbackNotice.type} mb-4`}>
              <Icon name={feedbackNotice.type === "success" ? "check" : "close"} size={16} />
              <span>{feedbackNotice.text}</span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="dashboard-tab-bar">
            <button
              type="button"
              className={`dashboard-tab-btn ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              <Icon name="briefcase" size={16} />
              <span>My Applications ({applications.length})</span>
            </button>
            <button
              type="button"
              className={`dashboard-tab-btn ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              <Icon name="bookmark" size={16} />
              <span>Saved Vacancies ({savedJobs.length})</span>
            </button>
          </div>

          {/* Tab 1: Applications */}
          {activeTab === "applications" && (
            <section className="dashboard-section">
              <div className="results-heading">
                <h2>Your Application History</h2>
                <span className="muted-text">{error || "Real-time candidate pipeline status"}</span>
              </div>

              {!loadedApps && (
                <div className="empty-state">
                  <div className="loader" />
                  <p>Loading your applications...</p>
                </div>
              )}

              {loadedApps && applications.length === 0 ? (
                <div className="empty-state">
                  <p>You have not applied to any job vacancies yet.</p>
                  <Link className="primary-button compact" href="/jobs">
                    Browse Active Vacancies
                  </Link>
                </div>
              ) : (
                <div className="application-list">
                  {applications.map((application) => {
                    const job =
                      typeof application.job === "object" && application.job !== null
                        ? (application.job as Job)
                        : { _id: String(application.job), title: "Job Vacancy", location: "Nepal" };

                    const canWithdraw = application.status === "applied" || application.status === "interview";
                    const isConfirming = confirmWithdrawId === application._id;

                    return (
                      <div className="application-row" key={application._id}>
                        <div className="company-mark">{(job.title || "J")[0]}</div>
                        <div className="app-detail-col">
                          <strong>{job.title}</strong>
                          <p>{job.location}</p>
                        </div>

                        <span className={`status ${application.status === "hired" ? "green" : application.status}`}>
                          {application.status.toUpperCase()}
                        </span>

                        <div className="app-actions-group">
                          <Link href={`/jobs/${job._id}`} className="accent-link">
                            View Vacancy →
                          </Link>

                          {canWithdraw && (
                            <>
                              {!isConfirming ? (
                                <button
                                  type="button"
                                  className="withdraw-action-btn"
                                  onClick={() => setConfirmWithdrawId(application._id)}
                                >
                                  Withdraw
                                </button>
                              ) : (
                                <div className="withdraw-confirm-popover">
                                  <span>Withdraw?</span>
                                  <button
                                    type="button"
                                    className="confirm-yes-btn"
                                    onClick={() => handleWithdraw(application._id)}
                                    disabled={withdrawingId === application._id}
                                  >
                                    {withdrawingId === application._id ? "..." : "Yes"}
                                  </button>
                                  <button
                                    type="button"
                                    className="confirm-no-btn"
                                    onClick={() => setConfirmWithdrawId(null)}
                                  >
                                    No
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Tab 2: Saved Vacancies */}
          {activeTab === "saved" && (
            <section className="dashboard-section">
              <div className="results-heading">
                <h2>Saved Vacancies &amp; Bookmarks</h2>
                <span className="muted-text">{savedJobs.length} Bookmarked Jobs</span>
              </div>

              {!loadedSaved && (
                <div className="empty-state">
                  <div className="loader" />
                  <p>Loading your saved vacancies...</p>
                </div>
              )}

              {loadedSaved && savedJobs.length === 0 ? (
                <div className="empty-state">
                  <p>You have not saved or bookmarked any vacancies yet.</p>
                  <Link className="primary-button compact" href="/jobs">
                    Discover Vacancies to Save
                  </Link>
                </div>
              ) : (
                <div className="saved-jobs-grid">
                  {savedJobs.map((job) => {
                    const compName =
                      typeof job.company === "object" && job.company !== null
                        ? job.company.companyName
                        : "Verified Employer";

                    return (
                      <div className="saved-job-card" key={job._id}>
                        <div className="saved-card-header">
                          <div className="company-mark small">{(compName || "H")[0]}</div>
                          <div className="saved-info-col">
                            <Link href={`/jobs/${job._id}`} className="saved-job-title hover-underline">
                              {job.title}
                            </Link>
                            <span className="saved-comp-name">{compName}</span>
                          </div>
                          <button
                            type="button"
                            className="remove-saved-btn"
                            title="Remove from saved"
                            onClick={() => handleRemoveSaved(job._id)}
                          >
                            ×
                          </button>
                        </div>

                        <div className="saved-meta-strip">
                          <span>
                            <Icon name="map" size={13} /> {job.location}
                          </span>
                          <span>
                            <Icon name="briefcase" size={13} /> {job.jobType}
                          </span>
                          {job.salary && (
                            <span className="saved-salary">
                              ${job.salary.toLocaleString()}/mo
                            </span>
                          )}
                        </div>

                        <div className="saved-card-footer">
                          <Link href={`/jobs/${job._id}`} className="primary-button compact full-width">
                            View &amp; Apply Now →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <section className="tip-card">
        <div className="tip-card-inner">
          <Icon name="spark" size={24} />
          <div>
            <strong>Enhance your candidate profile with AI matching.</strong>
            <p>Add your technical skills and a concise summary to rank higher on recruiter candidate searches.</p>
          </div>
          <Link href="/profile" className="secondary-button compact">
            Update Profile &amp; CV
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
