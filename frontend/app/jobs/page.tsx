"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { JobCard } from "@/src/components/JobCard";
import { PageShell } from "@/src/components/PageShell";
import { getJobs } from "@/src/lib/api";
import type { Job } from "@/src/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const text = `${job.title} ${job.description} ${job.location} ${job.skills.join(" ")}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (jobType === "all" || job.jobType === jobType);
  }), [jobs, search, jobType]);

  return (
    <PageShell>
      <section className="page-intro">
        <p className="eyebrow">Explore opportunities</p>
        <h1>Find a job that<br /><em>fits your life.</em></h1>
        <p>Search simple, meaningful opportunities from teams that are ready to meet you.</p>
      </section>
      <div className="filter-bar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, skill, or keyword" />
        <select value={jobType} onChange={(event) => setJobType(event.target.value)}>
          <option value="all">All job types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>
      <div className="results-heading"><h2>{filteredJobs.length} open roles</h2><Link href="/dashboard">View your applications →</Link></div>
      <div className="jobs-grid">{filteredJobs.map((job) => <JobCard key={job._id} job={job} onApply={() => undefined} />)}</div>
    </PageShell>
  );
}
