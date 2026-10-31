"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { applyForJob, getJob, toggleBookmark } from "@/src/lib/api";
import type { Job, User } from "@/src/types";

function computeSkillsComparison(userSkills: string[] | undefined, jobSkills: string[] | undefined) {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }
  if (!userSkills || userSkills.length === 0) {
    return { score: 0, matched: [], missing: jobSkills };
  }

  const userNorm = userSkills.map((s) => s.trim().toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];

  for (const js of jobSkills) {
    const norm = js.trim().toLowerCase();
    if (userNorm.some((us) => us === norm || norm.includes(us) || us.includes(norm))) {
      matched.push(js);
    } else {
      missing.push(js);
    }
  }

  const score = Math.min(100, Math.round((matched.length / jobSkills.length) * 100));
  return { score, matched, missing };
}

export function JobDetails({ id }: { id: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyNotice, setApplyNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem("hirehub-user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = window.localStorage.getItem("hirehub-user");
      if (stored) {
        const u = JSON.parse(stored) as User;
        if (u.savedJobs) {
          return u.savedJobs.some(
            (s) => (typeof s === "object" && s !== null ? s._id : s) === id
          );
        }
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [savingBookmark, setSavingBookmark] = useState(false);


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

  async function handleBookmarkToggle() {
    if (!user) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }
    if (savingBookmark) return;

    setSavingBookmark(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const res = await toggleBookmark(id);
      setIsSaved(res.bookmarked);
      const stored = window.localStorage.getItem("hirehub-user");
      if (stored) {
        const u = JSON.parse(stored) as User;
        u.savedJobs = res.savedJobs;
        window.localStorage.setItem("hirehub-user", JSON.stringify(u));
        setUser(u);
      }
    } catch {
      setIsSaved(!nextSaved);
    } finally {
      setSavingBookmark(false);
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
          _id: typeof job.company === "string" ? job.company : "",
          companyName: typeof job.company === "string" ? "Verified Employer" : "Growing Company",
          location: job.location,
          industry: "General",
          website: "",
          logo: "",
          description: "",
        };

  const skillsAnalysis = computeSkillsComparison(user?.profile?.skills, job.skills);

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
                  {company._id ? (
                    <Link href={`/companies/${company._id}`} className="company-link-bold hover-underline">
                      {company.companyName}
                    </Link>
                  ) : (
                    <strong>{company.companyName}</strong>
                  )}
                  <span className="verified-badge">
                    <Icon name="badgeCheck" size={13} /> Verified Employer
                  </span>
                  {skillsAnalysis.score > 0 && (
                    <span className="ai-match-badge" title="Profile Compatibility">
                      <Icon name="spark" size={12} />
                      {skillsAnalysis.score}% Match
                    </span>
                  )}
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

          {/* AI Skills Compatibility Banner (if user has profile skills or if candidate is logged in) */}
          {user && (
            <section className="ai-compatibility-card">
              <div className="ai-compat-header">
                <div className="ai-compat-title">
                  <span className="ai-spark-icon">✨</span>
                  <div>
                    <h3>AI Skills Compatibility Match</h3>
                    <p>Calculated between your profile proficiencies and this job&apos;s requirements.</p>
                  </div>
                </div>
                <div className="ai-score-pill">
                  <strong>{skillsAnalysis.score}%</strong>
                  <span>Match</span>
                </div>
              </div>

              <div className="ai-skills-breakdown">
                {skillsAnalysis.matched.length > 0 && (
                  <div className="matched-group">
                    <span className="breakdown-label">Matching Skills ({skillsAnalysis.matched.length}):</span>
                    <div className="skills-badge-wrap">
                      {skillsAnalysis.matched.map((s) => (
                        <span key={s} className="spec-skill-tag matched">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {skillsAnalysis.missing.length > 0 && (
                  <div className="missing-group">
                    <span className="breakdown-label">Missing / Desired Skills ({skillsAnalysis.missing.length}):</span>
                    <div className="skills-badge-wrap">
                      {skillsAnalysis.missing.map((s) => (
                        <span key={s} className="spec-skill-tag missing">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ai-profile-tip">
                <span>Want to increase your match percentage?</span>
                <Link href="/profile" className="accent-link">
                  Update Profile Skills →
                </Link>
              </div>
            </section>
          )}

          {/* Basic Job Information Table */}
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
            <div className="company-section-header">
              <h2>About {company.companyName}</h2>
              {company._id && (
                <Link href={`/companies/${company._id}`} className="accent-link">
                  View Public Showcase →
                </Link>
              )}
            </div>
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

            <div className="sidebar-action-buttons">
              <button
                type="button"
                className="primary-button full-width"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? "Submitting application..." : user ? "Apply Now →" : "Sign In to Apply"}
              </button>

              <button
                type="button"
                className={`bookmark-toggle-btn ${isSaved ? "saved" : ""}`}
                onClick={handleBookmarkToggle}
                disabled={savingBookmark}
              >
                <Icon
                  name="bookmark"
                  size={18}
                  fill={isSaved ? "currentColor" : "none"}
                />
                <span>{isSaved ? "Saved to Bookmarks" : "Save Vacancy"}</span>
              </button>
            </div>

            {!user && (
              <p className="sidebar-hint">
                Don&apos;t have an account? <Link href="/register" className="accent-link">Register free</Link> to apply.
              </p>
            )}

            {company._id && (
              <div className="sidebar-company-link-card">
                <span>Interested in this employer?</span>
                <Link href={`/companies/${company._id}`} className="accent-link">
                  Visit {company.companyName} Showcase →
                </Link>
              </div>
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
