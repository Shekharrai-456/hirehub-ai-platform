"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { getJob } from "@/src/lib/api";
import type { Job } from "@/src/types";

export function JobDetails({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJob(id).then(setJob).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageShell><div className="empty-state"><div className="loader" />Loading job...</div></PageShell>;
  }

  if (!job) {
    return <PageShell><div className="empty-state"><h2>Job not found</h2><Link className="primary-button" href="/jobs">Back to jobs</Link></div></PageShell>;
  }

  const company = typeof job.company === "string" ? "Growing company" : job.company.companyName;
  return (
    <PageShell>
      <Link className="back-link" href="/jobs">← Back to jobs</Link>
      <section className="job-detail">
        <div className="job-detail-main">
          <div className="company-mark large">{company.slice(0, 1)}</div>
          <p className="eyebrow">{company}</p>
          <h1>{job.title}</h1>
          <div className="job-meta"><span>{job.location}</span><span>{job.jobType}</span><span>{job.experience}</span></div>
          <hr />
          <h2>About the role</h2><p>{job.description}</p>
          <h2>What you&apos;ll need</h2>
          <ul>{job.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
        </div>
        <aside className="apply-card">
          <p className="eyebrow">Ready to apply?</p>
          <h2>${job.salary.toLocaleString()} <small>/ year</small></h2>
          <p>This frontend is ready for the application API to be connected.</p>
          <Link className="primary-button full-width" href={`/login?job=${job._id}`}>Sign in to apply</Link>
          <Link className="secondary-button full-width" href="/profile">Complete your profile</Link>
        </aside>
      </section>
    </PageShell>
  );
}
