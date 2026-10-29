import type { Job } from "@/src/types";
import Link from "next/link";
import { Icon } from "./Icon";

function companyName(job: Job) {
  return typeof job.company === "string" ? "Growing company" : job.company?.companyName ?? "Growing company";
}

export function JobCard({ job, onApply }: { job: Job; onApply?: (job: Job) => void }) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <div className="company-mark">{companyName(job).slice(0, 1).toUpperCase()}</div>
        <div>
          <p className="eyebrow">{companyName(job)}</p>
          <h3>{job.title}</h3>
        </div>
        <span className="save-label">New</span>
      </div>
      <div className="job-meta">
        <span><Icon name="map" size={15} />{job.location}</span>
        <span><Icon name="briefcase" size={15} />{job.jobType}</span>
        <span><Icon name="spark" size={15} />{job.experience}</span>
      </div>
      <p className="job-description">{job.description}</p>
      <div className="skill-list">
        {job.skills?.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <div className="job-card-footer">
        <strong>{job.salary ? `$${job.salary.toLocaleString()}` : "Salary negotiable"}<small> / year</small></strong>
        {onApply ? (
          <button className="text-button" onClick={() => onApply(job)}>View & apply <Icon name="arrow" size={16} /></button>
        ) : (
          <Link className="text-button" href={`/jobs/${job._id}`}>View & apply <Icon name="arrow" size={16} /></Link>
        )}
      </div>
    </article>
  );
}
