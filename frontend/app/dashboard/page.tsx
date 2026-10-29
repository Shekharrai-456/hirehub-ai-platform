"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { getApplications } from "@/src/lib/api";
import type { Application, Job, User } from "@/src/types";

function readUser(): User | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem("hirehub-user");
  return saved ? JSON.parse(saved) as User : null;
}

export default function DashboardPage() {
  const [user] = useState<User | null>(readUser);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getApplications(user._id).then(setApplications).catch((reason) => {
      setError(reason instanceof Error ? reason.message : "Could not load applications.");
    });
  }, [user]);

  return (
    <PageShell>
      <section className="dashboard-heading">
        <div><p className="eyebrow">Your workspace</p><h1>{user ? `Welcome, ${user.fullName.split(" ")[0]}.` : "Sign in to see your applications."}</h1><p>Keep track of your real applications and discover your next opportunity.</p></div>
        <Link className="primary-button" href="/jobs">Find more jobs →</Link>
      </section>
      {!user && <div className="empty-state"><p>Please sign in before viewing your applications.</p><Link className="primary-button" href="/login">Sign in</Link></div>}
      {user && <><div className="stats-row"><div><strong>0</strong><span>Saved jobs</span></div><div><strong>{applications.length}</strong><span>Applications sent</span></div><div><strong>—</strong><span>Profile views</span></div></div>
        <section className="dashboard-section"><div className="results-heading"><h2>Recent applications</h2><span className="muted-text">{error || "Live application data"}</span></div>
          {applications.length === 0 ? <div className="empty-state"><p>You have not applied to any jobs yet.</p><Link className="primary-button" href="/jobs">Browse jobs</Link></div> : <div className="application-list">{applications.map((application) => {
            const job = application.job as Job;
            return <div className="application-row" key={application._id}><div className="company-mark">{job.title[0]}</div><div><strong>{job.title}</strong><p>{job.location}</p></div><span className="status green">{application.status}</span><Link href={`/jobs/${job._id}`}>View →</Link></div>;
          })}</div>}
        </section>
      </>}
      <section className="tip-card"><strong>Make your profile stand out.</strong><p>Add your skills and a short bio so employers can get to know you.</p><Link href="/profile">Complete profile →</Link></section>
    </PageShell>
  );
}
