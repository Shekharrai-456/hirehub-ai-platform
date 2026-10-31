"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { JobCard } from "@/src/components/JobCard";
import { API_BASE, getCompany, getCompanyJobs } from "@/src/lib/api";
import type { Company, Job } from "@/src/types";

export default function CompanyShowcasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      getCompany(id).catch(() => null),
      getCompanyJobs(id).catch(() => []),
    ])
      .then(([compData, jobsData]) => {
        if (!active) return;
        if (!compData) {
          setError("Company not found.");
        } else {
          setCompany(compData);
          setJobs(jobsData);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load company.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <div className="empty-state">
          <div className="loader" />
          <p>Loading company showcase...</p>
        </div>
      </PageShell>
    );
  }

  if (error || !company) {
    return (
      <PageShell>
        <div className="empty-state">
          <h2>Organization Not Found</h2>
          <p>The company profile you are seeking might have been updated or does not exist.</p>
          <div className="empty-state-actions">
            <Link className="primary-button" href="/jobs">
              Browse Active Vacancies
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const logoUrl = company.logo
    ? company.logo.startsWith("http")
      ? company.logo
      : `${API_BASE}${company.logo}`
    : null;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="job-breadcrumb">
        <Link href="/jobs" className="back-link">
          ← Back to All Vacancies
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span>Companies</span>
        <span className="breadcrumb-separator">/</span>
        <span className="current-page">{company.companyName}</span>
      </div>

      {/* Hero Showcase Banner */}
      <section className="company-showcase-hero">
        <div className="company-hero-container">
          <div className="company-hero-avatar-slot">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={company.companyName}
                className="company-hero-logo-img"
              />
            ) : (
              <div className="company-mark huge">
                {(company.companyName || "C")[0]}
              </div>
            )}
          </div>

          <div className="company-hero-info">
            <div className="company-title-wrap">
              <h1 className="company-hero-title">{company.companyName}</h1>
              <span className="verified-badge-lg">
                <Icon name="badgeCheck" size={16} /> Verified Hiring Partner
              </span>
            </div>

            <div className="company-meta-strip">
              {company.location && (
                <span className="meta-badge">
                  <Icon name="map" size={15} /> {company.location}
                </span>
              )}
              {company.industry && (
                <span className="meta-badge">
                  <Icon name="building" size={15} /> {company.industry}
                </span>
              )}
              {company.size && (
                <span className="meta-badge">
                  <Icon name="user" size={15} /> {company.size}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-badge link-badge"
                >
                  <Icon name="arrow" size={14} /> {company.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Overview & Open Positions */}
      <div className="showcase-layout-grid">
        {/* Left Column: About & Benefits */}
        <div className="showcase-left-col">
          <section className="detail-section-card">
            <h2>About {company.companyName}</h2>
            <p className="detail-prose">
              {company.description ||
                `${company.companyName} is an innovative organization providing professional services and modern working standards in Nepal. Committed to fair hiring, technical excellence, and sustainable talent development.`}
            </p>
          </section>

          {/* Perks & Benefits Card */}
          <section className="detail-section-card">
            <h2>Why Work at {company.companyName}?</h2>
            <div className="benefits-features-grid">
              <div className="benefit-feature-item">
                <div className="benefit-icon-slot">🚀</div>
                <div>
                  <strong>High Growth Environment</strong>
                  <p>Accelerate your career with ambitious projects and clear mentorship pathways.</p>
                </div>
              </div>

              <div className="benefit-feature-item">
                <div className="benefit-icon-slot">💰</div>
                <div>
                  <strong>Competitive Compensation</strong>
                  <p>Timely performance evaluations, annual bonuses, and provident fund support.</p>
                </div>
              </div>

              <div className="benefit-feature-item">
                <div className="benefit-icon-slot">🌿</div>
                <div>
                  <strong>Work-Life Harmony</strong>
                  <p>Flexible schedules, hybrid collaboration options, and generous paid leave.</p>
                </div>
              </div>

              <div className="benefit-feature-item">
                <div className="benefit-icon-slot">💻</div>
                <div>
                  <strong>Modern Tech Stack</strong>
                  <p>Work with state-of-the-art tooling, continuous learning stipends, and hardware allowances.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Details Card */}
          <section className="detail-section-card">
            <h2>Company Contact</h2>
            <div className="company-info-row">
              {company.email && <span><strong>Email:</strong> {company.email}</span>}
              {company.phoneNumber && <span><strong>Phone:</strong> {company.phoneNumber}</span>}
              {company.location && <span><strong>Headquarters:</strong> {company.location}</span>}
            </div>
          </section>
        </div>

        {/* Right Column: Open Vacancies list */}
        <div className="showcase-right-col">
          <div className="open-vacancies-header">
            <div>
              <h2>Current Openings</h2>
              <span className="muted-text">
                {jobs.length} active {jobs.length === 1 ? "vacancy" : "vacancies"} available
              </span>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>There are currently no active job vacancies posted by {company.companyName}.</p>
              <Link className="primary-button compact" href="/jobs">
                Explore Other Vacancies
              </Link>
            </div>
          ) : (
            <div className="showcase-jobs-list">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
