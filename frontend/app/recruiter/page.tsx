"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { createJob, getApplicants, getCompanyJobs } from "@/src/lib/api";
import type { Application, Company, Job } from "@/src/types";

const emptyForm = { title: "", description: "", requirements: "", location: "", jobType: "full-time", experience: "", position: "", salary: "", skills: "" };

export default function RecruiterPage() {
  const [company] = useState<Company | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem("hirehub-company");
    return saved ? JSON.parse(saved) as Company : null;
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [applicants, setApplicants] = useState<Record<string, Application[]>>({});

  useEffect(() => {
    if (company) {
      getCompanyJobs(company._id).then(setJobs).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load jobs."));
    }
  }, [company]);

  async function submitJob(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await createJob({ ...form, company: company?._id ?? "" });
      setJobs((currentJobs) => [result.job, ...currentJobs]);
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Job posted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not post job.");
    }
  }

  async function showApplicants(jobId: string) {
    const result = await getApplicants(jobId);
    setApplicants((current) => ({ ...current, [jobId]: result }));
  }

  if (!company) return <PageShell><div className="empty-state"><p>Sign in as a company to manage jobs.</p><Link className="primary-button" href="/login">Company sign in</Link></div></PageShell>;

  return (
    <PageShell>
      <section className="dashboard-heading"><div><p className="eyebrow">Employer workspace</p><h1>{company.companyName}<br /><em>build your team.</em></h1><p>Post real jobs and review applicants from your database.</p></div><button className="primary-button" onClick={() => setShowForm(!showForm)}>{showForm ? "Close form" : "Post a job"} →</button></section>
      {message && <p className="form-message">{message}</p>}
      {showForm && <form className="profile-form recruiter-form" onSubmit={submitJob}>
        <label>Job title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Description<textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label>Requirements<input required placeholder="One, Two, Three" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></label><label>Location<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label><label>Job type<select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}><option>full-time</option><option>part-time</option><option>contract</option><option>internship</option></select></label><label>Experience<input required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label><label>Position<input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></label><label>Salary<input required type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></label><label>Skills<input required placeholder="React, Node.js" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label><button className="primary-button">Post job</button>
      </form>}
      <section className="dashboard-section"><div className="results-heading"><h2>Your active jobs</h2><span className="muted-text">{jobs.length} open roles</span></div>{jobs.length === 0 ? <div className="empty-state"><p>You have not posted any jobs yet.</p></div> : <div className="application-list">{jobs.map((job) => <div key={job._id}><div className="application-row"><div className="company-mark">{job.title[0]}</div><div><strong>{job.title}</strong><p>{job.location} · {job.jobType}</p></div><span className="status green">{applicants[job._id]?.length ?? 0} applicants</span><button className="text-button" onClick={() => showApplicants(job._id)}>View →</button></div>{applicants[job._id]?.map((application) => <div className="applicant-row" key={application._id}>{typeof application.applicant === "string" ? application.applicant : `${application.applicant.fullName} · ${application.applicant.email}`}<span className="status">{application.status}</span></div>)}</div>)}</div>}</section>
    </PageShell>
  );
}
