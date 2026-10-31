"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { toggleBookmark } from "@/src/lib/api";
import type { Job, User } from "@/src/types";

function getCompany(job: Job) {
  if (typeof job.company === "object" && job.company !== null) {
    return job.company;
  }
  return {
    _id: typeof job.company === "string" ? job.company : "",
    companyName: typeof job.company === "string" ? "Verified Employer" : "Growing Company",
    logo: "",
  };
}

function computeSkillsMatch(userSkills: string[] | undefined, jobSkills: string[] | undefined): number {
  if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) {
    return 0;
  }
  const normalizedCandidate = userSkills.map((s) => s.trim().toLowerCase());
  let matches = 0;
  for (const js of jobSkills) {
    const norm = js.trim().toLowerCase();
    if (normalizedCandidate.some((cs) => cs === norm || norm.includes(cs) || cs.includes(norm))) {
      matches += 1;
    }
  }
  return Math.min(100, Math.round((matches / jobSkills.length) * 100));
}

export function JobCard({
  job,
  onApply,
  isBookmarkedInitial = false,
  onBookmarkChange,
}: {
  job: Job;
  onApply?: (job: Job) => void;
  isBookmarkedInitial?: boolean;
  onBookmarkChange?: (jobId: string, bookmarked: boolean) => void;
}) {
  const router = useRouter();
  const company = getCompany(job);
  const initial = (company.companyName || "H").slice(0, 1).toUpperCase();

  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === "undefined") return isBookmarkedInitial;
    try {
      const stored = window.localStorage.getItem("hirehub-user");
      if (stored) {
        const u = JSON.parse(stored) as User;
        if (u.savedJobs) {
          return u.savedJobs.some(
            (s) => (typeof s === "object" && s !== null ? s._id : s) === job._id
          );
        }
      }
    } catch {
      // ignore
    }
    return isBookmarkedInitial;
  });

  const [matchScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = window.localStorage.getItem("hirehub-user");
      if (stored) {
        const u = JSON.parse(stored) as User;
        if (u.profile?.skills) {
          return computeSkillsMatch(u.profile.skills, job.skills);
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [isSaving, setIsSaving] = useState(false);

  async function handleBookmarkClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;

    // Check if user is logged in
    const stored = window.localStorage.getItem("hirehub-user");
    if (!stored) {
      router.push(`/login?redirect=/jobs/${job._id}`);
      return;
    }


    setIsSaving(true);
    const newStatus = !isSaved;
    setIsSaved(newStatus);

    try {
      const res = await toggleBookmark(job._id);
      setIsSaved(res.bookmarked);
      // Update local storage
      const u = JSON.parse(stored) as User;
      u.savedJobs = res.savedJobs;
      window.localStorage.setItem("hirehub-user", JSON.stringify(u));
      onBookmarkChange?.(job._id, res.bookmarked);
    } catch {
      // Revert if error
      setIsSaved(!newStatus);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="merojob-card">
      <div className="merojob-card-header">
        <div className="company-logo-slot">
          {company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo}
              alt={company.companyName}
              className="company-logo-img"
            />
          ) : (
            <div className="company-mark">{initial}</div>
          )}
        </div>

        <div className="job-title-group">
          <div className="title-row">
            <Link href={`/jobs/${job._id}`} className="job-heading-link">
              <h3 className="job-title">{job.title}</h3>
            </Link>
            <div className="header-badges-wrap">
              {matchScore >= 35 && (
                <span className="ai-match-badge" title="AI Skills Compatibility with your profile">
                  <Icon name="spark" size={12} />
                  {matchScore}% Match
                </span>
              )}
              {job.featured && <span className="featured-badge">Hot Job</span>}
            </div>
          </div>

          <div className="company-subline">
            {company._id ? (
              <Link href={`/companies/${company._id}`} className="company-name hover-underline">
                {company.companyName}
              </Link>
            ) : (
              <span className="company-name">{company.companyName}</span>
            )}
            <span className="verified-icon" title="Verified Organization">
              <Icon name="badgeCheck" size={14} />
            </span>
            {job.category && <span className="cat-pill">{job.category}</span>}
          </div>
        </div>

        {/* Bookmark Action Button */}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className={`card-bookmark-btn ${isSaved ? "active" : ""}`}
          title={isSaved ? "Remove from Bookmarks" : "Save this Vacancy"}
          aria-label={isSaved ? "Saved" : "Save Job"}
          disabled={isSaving}
        >
          <Icon
            name="bookmark"
            size={18}
            fill={isSaved ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="merojob-card-meta">
        <span className="meta-item">
          <Icon name="map" size={14} />
          {job.location}
        </span>
        <span className="meta-item">
          <Icon name="briefcase" size={14} />
          {job.jobType}
        </span>
        <span className="meta-item">
          <Icon name="spark" size={14} />
          {job.experience}
        </span>
        {job.deadline && (
          <span className="deadline-badge">
            <Icon name="clock" size={13} />
            {job.deadline}
          </span>
        )}
      </div>

      <p className="job-description-snip">{job.description}</p>

      {job.skills && job.skills.length > 0 && (
        <div className="card-skills-row">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-pill">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="skill-pill-more">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="merojob-card-footer">
        <div className="salary-box">
          <span className="salary-label">Offered Salary</span>
          <strong className="salary-amount">
            {job.salary ? `$${job.salary.toLocaleString()}` : "Negotiable"}
            <small> / mo</small>
          </strong>
        </div>

        <div className="card-actions">
          {onApply && (
            <button
              type="button"
              className="quick-apply-btn"
              onClick={() => onApply(job)}
            >
              Quick Apply
            </button>
          )}
          <Link href={`/jobs/${job._id}`} className="detail-view-btn">
            View Details <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
