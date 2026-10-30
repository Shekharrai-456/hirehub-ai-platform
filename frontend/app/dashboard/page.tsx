"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { getApplications } from "@/src/lib/api";
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    let active = true;
    getApplications(user._id)
      .then((data) => {
        if (active) {
          setApplications(data);
          setLoaded(true);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not load applications.");
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [user?._id]);

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
          <p>Track your submitted applications, interview stages, and profile status.</p>
        </div>
        <Link className="primary-button" href="/jobs">
          Explore Vacancies →
        </Link>
      </section>

      {mounted && !user && (
        <div className="empty-state">
          <h2>Sign in Required</h2>
          <p>Please sign in to track your job applications and status updates.</p>
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
              <strong>{interviewCount}</strong>
              <span>Interview Invitations</span>
            </div>
            <div>
              <strong>{hiredCount}</strong>
              <span>Job Offers</span>
            </div>
          </div>

          <section className="dashboard-section">
            <div className="results-heading">
              <h2>Your Application History</h2>
              <span className="muted-text">{error || "Real-time application status"}</span>
            </div>

            {!loaded && (
              <div className="empty-state">
                <div className="loader" />
                <p>Loading your applications...</p>
              </div>
            )}

            {loaded && applications.length === 0 ? (
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
                      <Link href={`/jobs/${job._id}`} className="accent-link">
                        View Vacancy →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
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
            Update Profile
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
