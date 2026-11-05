"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { applyForJob, getJob, toggleSaveJob } from "@/src/lib/api";
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
  const [isSaved, setIsSaved] = useState(() => Boolean(user?.profile?.savedJobs?.includes(id)));

  useEffect(() => {
    getJob(id)
      .then(setJob)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleToggleBookmark() {
    if (!user) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      await toggleSaveJob(id);
    } catch {
      // optimistic UI
    }
  }

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
          {/* Header Hero Card */}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    <span className="eyebrow-accent">{job.category || "Career Vacancy"}</span>
                    <h1 className="job-hero-title">{job.title}</h1>
                    <div className="hero-company-line">
                      <strong>{company.companyName}</strong>
                      <span className="verified-icon" title="Verified Employer">
                        <Icon name="badgeCheck" size={15} />
                      </span>
                      <span>• {job.location}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`bookmark-action-btn ${isSaved ? "saved" : ""}`}
                    onClick={handleToggleBookmark}
                    title={isSaved ? "Remove from bookmarks" : "Bookmark this vacancy"}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                    }}
                  >
                    <Icon name="bookmark" size={16} />
                    <span>{isSaved ? "Bookmarked" : "Save Job"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metric Specifications Grid */}
            <div className="job-spec-grid">
              <div className="spec-item">
                <div className="spec-icon-box">
                  <Icon name="dollar" size={16} />
                </div>
                <div>
                  <span className="spec-label">Offered Salary</span>
                  <strong className="spec-val">
                    {job.salary ? `Rs. ${job.salary.toLocaleString()}` : "Negotiable"}
                  </strong>
                </div>
              </div>

              <div className="spec-item">
                <div className="spec-icon-box">
                  <Icon name="briefcase" size={16} />
                </div>
                <div>
                  <span className="spec-label">Employment Type</span>
                  <strong className="spec-val capitalize">{job.jobType}</strong>
                </div>
              </div>

              <div className="spec-item">
                <div className="spec-icon-box">
                  <Icon name="spark" size={16} />
                </div>
                <div>
                  <span className="spec-label">Experience Required</span>
                  <strong className="spec-val">{job.experience}</strong>
                </div>
              </div>

              <div className="spec-item">
                <div className="spec-icon-box">
                  <Icon name="clock" size={16} />
                </div>
                <div>
                  <span className="spec-label">Apply Deadline</span>
                  <strong className="spec-val">{job.deadline || "30 days left"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description & Specification */}
          <div className="detail-content-card">
            <h2 className="detail-section-title">
              <Icon name="fileText" size={18} /> Job Overview
            </h2>
            <div className="detail-prose">
              <p>{job.description}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <>
                <h2 className="detail-section-title" style={{ marginTop: "28px" }}>
                  <Icon name="checkCircle" size={18} /> Requirements &amp; Qualifications
                </h2>
                <div className="detail-prose">
                  <ul>
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {job.skills && job.skills.length > 0 && (
              <>
                <h2 className="detail-section-title" style={{ marginTop: "28px" }}>
                  <Icon name="zap" size={18} /> Required Competencies
                </h2>
                <div className="card-skills-row" style={{ marginTop: "10px" }}>
                  {job.skills.map((skill) => (
                    <span key={skill} className="skill-pill" style={{ padding: "6px 12px", fontSize: "13px" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Company Profile Card */}
          <div className="detail-content-card">
            <h2 className="detail-section-title">
              <Icon name="building" size={18} /> About {company.companyName}
            </h2>
            <div className="detail-prose">
              <p>
                {company.description ||
                  `${company.companyName} is an industry-recognized employer in Nepal with verified credentials, modern work environment, and clear paths for talent development.`}
              </p>
            </div>
            {company.website && (
              <p style={{ marginTop: "12px", fontSize: "13.5px" }}>
                <strong>Official Website:</strong>{" "}
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="accent-link">
                  {company.website} <Icon name="external" size={12} />
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="detail-sidebar">
          <div className="sidebar-action-card">
            <div className="apply-card-top">
              <span className="eyebrow-accent">APPLICATION STATUS</span>
              <h3>Interested in this role?</h3>
              <p>Applications are reviewed directly by the employer hiring team.</p>
            </div>

            {applyNotice && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: applyNotice.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
                  color: applyNotice.type === "success" ? "var(--success)" : "var(--danger)",
                  border: `1px solid ${applyNotice.type === "success" ? "var(--success-border)" : "var(--danger-border)"}`,
                }}
              >
                {applyNotice.message}
              </div>
            )}

            <button
              type="button"
              className="primary-button apply-button-large"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? "Submitting Application..." : "Apply for Vacancy"}
            </button>

            <div style={{ marginTop: "18px", textAlign: "center", fontSize: "12px", color: "var(--muted)" }}>
              <span>Verified vacancy • No application fee</span>
            </div>
          </div>

          <div className="sidebar-info-card">
            <h4 style={{ fontSize: "14px", fontWeight: 800, margin: "0 0 12px" }}>Vacancy Highlights</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "var(--muted)" }}>
              <li><strong>Category:</strong> {job.category || "Information Technology"}</li>
              <li><strong>Location:</strong> {job.location}</li>
              <li><strong>Level:</strong> {job.position || "Mid Level"}</li>
              <li><strong>Type:</strong> {job.jobType}</li>
              <li><strong>Posted:</strong> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Sticky Bottom Mobile Bar */}
      <div className="mobile-sticky-apply-bar">
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--subtle)", display: "block" }}>Offered Salary</span>
          <strong style={{ fontSize: "15px", color: "var(--green)" }}>
            {job.salary ? `Rs. ${job.salary.toLocaleString()}` : "Negotiable"}
          </strong>
        </div>
        <button
          type="button"
          className="primary-button compact"
          onClick={handleApply}
          disabled={applying}
        >
          {applying ? "Applying..." : "Apply Now"}
        </button>
      </div>
    </PageShell>
  );
}
