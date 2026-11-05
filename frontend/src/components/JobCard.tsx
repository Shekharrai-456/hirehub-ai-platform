"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { toggleSaveJob } from "@/src/lib/api";
import type { Job } from "@/src/types";

function getCompany(job: Job) {
  if (typeof job.company === "object" && job.company !== null) {
    return job.company;
  }
  return {
    _id: typeof job.company === "string" ? job.company : "",
    companyName: typeof job.company === "string" ? "Verified Employer" : "Growing Enterprise",
    logo: "",
  };
}

export function JobCard({
  job,
  onApply,
  isSavedInitial = false,
}: {
  job: Job;
  onApply?: (job: Job) => void;
  isSavedInitial?: boolean;
}) {
  const company = getCompany(job);
  const initial = (company.companyName || "H").slice(0, 1).toUpperCase();
  const [saved, setSaved] = useState(isSavedInitial);
  const [savingBookmark, setSavingBookmark] = useState(false);

  async function handleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (savingBookmark) return;
    setSavingBookmark(true);
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      await toggleSaveJob(job._id);
    } catch {
      // Keep optimistic UI
    } finally {
      setSavingBookmark(false);
    }
  }

  return (
    <article className="merojob-card">
      <div>
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
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {job.featured && <span className="featured-badge">Hot Job</span>}
                <button
                  type="button"
                  className={`bookmark-action-btn ${saved ? "saved" : ""}`}
                  onClick={handleBookmark}
                  title={saved ? "Remove from bookmarks" : "Bookmark this job"}
                  aria-label="Bookmark"
                >
                  <Icon name="bookmark" size={16} />
                </button>
              </div>
            </div>

            <div className="company-subline">
              <span className="company-name">{company.companyName}</span>
              <span className="verified-icon" title="Verified Employer">
                <Icon name="badgeCheck" size={14} />
              </span>
              {job.category && <span className="cat-pill">{job.category}</span>}
            </div>
          </div>
        </div>

        <div className="merojob-card-meta">
          <span className="meta-item">
            <Icon name="map" size={13} />
            {job.location}
          </span>
          <span className="meta-item">
            <Icon name="briefcase" size={13} />
            <span className="capitalize">{job.jobType}</span>
          </span>
          <span className="meta-item">
            <Icon name="spark" size={13} />
            {job.experience}
          </span>
          {job.deadline && (
            <span className="deadline-badge">
              <Icon name="clock" size={12} />
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
              <span className="skill-pill-more">+{job.skills.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      <div className="merojob-card-footer">
        <div className="salary-box">
          <span className="salary-label">Offered Salary</span>
          <strong className="salary-amount">
            {job.salary ? `Rs. ${job.salary.toLocaleString()}` : "Negotiable"}
          </strong>
        </div>

        <div className="card-actions-row">
          <Link href={`/jobs/${job._id}`} className="card-view-btn">
            Details
          </Link>
          {onApply && (
            <button
              type="button"
              className="primary-button compact"
              onClick={() => onApply(job)}
            >
              Apply <Icon name="arrow" size={12} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
