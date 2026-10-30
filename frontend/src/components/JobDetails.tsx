"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { applyForJob, getJob } from "@/src/lib/api";
import type { Job, User } from "@/src/types";

export function JobDetails({ id }: { id: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyNotice, setApplyNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem("hirehub-user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    getJob(id)
      .then(setJob)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApply() {
    if (!user) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }
    setApplying(true);
    setApplyNotice(null);
    try {
      await applyForJob(id);
      setApplyNotice({
        type: "success",
        message: "Your application has been successfully submitted to the employer!",
      });
    } catch (error) {
      setApplyNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to apply. Please try again.",
      });
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="empty-state">
          <div className="loader" />
          <p>Loading vacancy details...</p>
        </div>
      </PageShell>
    );
  }

  if (!job) {
    return (
      <PageShell>
        <div className="empty-state">
          <h2>Job Not Found</h2>
          <p>The vacancy you are looking for may have expired or been removed.</p>
          <Link className="primary-button" href="/jobs">
            Back to All Vacancies
          </Link>
        </div>
      </PageShell>
    );
  }

  const company =
    typeof job.company === "object" && job.company !== null
      ? job.company
      : {
          companyName: typeof job.company === "string" ? "Verified Employer" : "Growing Company",
          location: job.location,
          industry: "General",
          website: "",
          logo: "",
          description: "",
        };

  return (
    <PageShell>
      <div className="job-breadcrumb">
        <Link href="/jobs" className="back-link">
          ← Back to All Vacancies
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span>{job.category || "Jobs"}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="current-page">{job.title}</span>
      </div>

      <div className="merojob-detail-layout">
        <div className="detail-main-column">
          {/* Header Banner */}
          <div className="job-hero-card">
            <div className="job-hero-top">
              <div className="hero-logo-box">
                {company.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo} alt={company.companyName} className="hero-logo-img" />
                ) : (
                  <div className="company-mark large">{(company.companyName || "H").slice(0, 1)}</div>
                )}
              </div>
              <div className="hero-text-box">
                <span className="eyebrow-accent">{job.category || "Career Vacancy"}</span>
                <h1 className="job-hero-title">{job.title}</h1>
                <div className="hero-company-line">
                  <strong>{company.companyName}</strong>
                  <span className="verified-badge"><Icon name="badgeCheck" size={13} /> Verified Employer</span>
                </div>
              </div>
            </div>

            <div className="job-highlights-row">
              <div className="highlight-pill">
                <Icon name="map" size={15} />
                <span>{job.location}</span>
              </div>
              <div className="highlight-pill">
                <Icon name="briefcase" size={15} />
                <span>{job.jobType}</span>
              </div>
              <div className="highlight-pill">
                <Icon name="spark" size={15} />
                <span>{job.experience}</span>
              </div>
              <div className="highlight-pill highlight-deadline">
                <Icon name="clock" size={15} />
                <span>{job.deadline || "Apply Soon"}</span>
              </div>
            </div>
          </div>

          {/* Basic Job Information Table (Merojob Specification style) */}
          <section className="spec-table-card">
            <h2 className="spec-heading">Basic Job Information</h2>
            <div className="spec-grid">
              <div className="spec-cell">
                <span className="spec-label">Job Category</span>
                <strong className="spec-val">{job.category || "Information Technology"}</strong>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Job Level</span>
                <strong className="spec-val">{job.position || "Mid Level"}</strong>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Employment Type</span>
                <strong className="spec-val">{job.jobType}</strong>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Offered Salary</span>
                <strong className="spec-val highlight-green">
                  {job.salary ? `$${job.salary.toLocaleString()} / mo` : "Negotiable"}
                </strong>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Apply Before</span>
                <strong className="spec-val">{job.deadline || "30 days remaining"}</strong>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Job Location</span>
                <strong className="spec-val">{job.location}</strong>
              </div>
            </div>
          </section>

          {/* Job Description & Specification */}
          <section className="detail-section-card">
            <h2>Job Description</h2>
            <p className="detail-prose">{job.description}</p>

            <h2>Job Specification &amp; Requirements</h2>
            <ul className="requirements-list">
              {job.requirements.map((req, idx) => (
                <li key={idx}>
                  <Icon name="check" size={16} />
                  <span>{req}</span>
                </li>
              ))}
            </ul>

            {job.skills && job.skills.length > 0 && (
              <>
                <h2>Key Competencies &amp; Skills</h2>
                <div className="skills-badge-wrap">
                  {job.skills.map((skill) => (
                    <span key={skill} className="spec-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* About Company */}
          <section className="detail-section-card">
            <h2>About {company.companyName}</h2>
            <p className="detail-prose">
              {company.description ||
                `${company.companyName} is an industry-leading organization dedicated to professional growth, modern workplace standards, and talent development.`}
            </p>
            <div className="company-info-row">
              {company.location && <span><strong>Location:</strong> {company.location}</span>}
              {company.industry && <span><strong>Industry:</strong> {company.industry}</span>}
              {company.website && (
                <span>
                  <strong>Website:</strong>{" "}
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="accent-link">
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </span>
              )}
            </div>
          </section>
        </div>

        {/* Right Sticky Sidebar */}
        <aside className="detail-sidebar-column">
          <div className="sticky-apply-box">
            <span className="eyebrow-accent">APPLICATION DEADLINE</span>
            <div className="deadline-timer">
              <Icon name="clock" size={20} />
              <span>{job.deadline || "Open for Applications"}</span>
            </div>

            <div className="sidebar-salary-summary">
              <span className="salary-label">Offered Monthly Salary</span>
              <h3 className="salary-figure">
                {job.salary ? `$${job.salary.toLocaleString()}` : "Negotiable"}
              </h3>
            </div>

            {applyNotice && (
              <div className={`apply-alert ${applyNotice.type}`}>
                <Icon name={applyNotice.type === "success" ? "check" : "close"} size={16} />
                <span>{applyNotice.message}</span>
              </div>
            )}

            <button
              type="button"
              className="primary-button full-width"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? "Submitting application..." : user ? "Apply Now →" : "Sign In to Apply"}
            </button>

            {!user && (
              <p className="sidebar-hint">
                Don&apos;t have an account? <Link href="/register" className="accent-link">Register free</Link> to apply.
              </p>
            )}

            <div className="sidebar-security-badge">
              <Icon name="badgeCheck" size={16} />
              <span>Verified Hiring Partner with HireHub</span>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
