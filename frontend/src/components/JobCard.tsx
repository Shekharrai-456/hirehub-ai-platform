import type { Job } from "@/src/types";
import Link from "next/link";
import { Icon } from "./Icon";

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

export function JobCard({
  job,
  onApply,
}: {
  job: Job;
  onApply?: (job: Job) => void;
}) {
  const company = getCompany(job);
  const initial = (company.companyName || "H").slice(0, 1).toUpperCase();

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
            {job.featured && <span className="featured-badge">Hot Job</span>}
          </div>

          <div className="company-subline">
            <span className="company-name">{company.companyName}</span>
            <span className="verified-icon" title="Verified Organization">
              <Icon name="badgeCheck" size={14} />
            </span>
            {job.category && <span className="cat-pill">{job.category}</span>}
          </div>
        </div>
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
