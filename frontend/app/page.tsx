"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthModal } from "@/src/components/AuthModal";
import { Icon } from "@/src/components/Icon";
import { JobCard } from "@/src/components/JobCard";
import { SiteHeader } from "@/src/components/SiteHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { applyForJob, getCompanies, getJobs } from "@/src/lib/api";
import type { Company, Job, User } from "@/src/types";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState<"top" | "recent" | "companies">("top");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("hirehub-user");
    return stored ? (JSON.parse(stored) as User) : null;
  });

  useEffect(() => {
    Promise.all([getJobs(), getCompanies()])
      .then(([jobsData, companiesData]) => {
        setJobs(jobsData);
        setCompanies(companiesData);
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Could not load vacancies.");
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [
    { id: "all", name: "All Categories", count: jobs.length, icon: "briefcase" as const },
    { id: "Information Technology", name: "IT & Telecommunications", count: jobs.filter(j => j.category === "Information Technology" || j.skills?.some(s => ["React", "Node", "Python", "Cloud"].includes(s))).length || 4, icon: "code" as const },
    { id: "Banking & Financial Services", name: "Banking, Finance & Insurance", count: jobs.filter(j => j.category?.includes("Banking") || j.category?.includes("Finance")).length || 2, icon: "dollar" as const },
    { id: "Healthcare & Pharmaceuticals", name: "Healthcare & Medical", count: jobs.filter(j => j.category?.includes("Health") || j.category?.includes("Medical")).length || 1, icon: "spark" as const },
    { id: "Advertising, Design & Media", name: "Creative, Design & Media", count: jobs.filter(j => j.category?.includes("Design") || j.category?.includes("Media")).length || 2, icon: "award" as const },
    { id: "Education & Non-Profit", name: "Education & Non-Profit", count: jobs.filter(j => j.category?.includes("Education")).length || 1, icon: "bookmark" as const },
    { id: "Sales & Business Development", name: "Sales & Business Dev", count: jobs.filter(j => j.category?.includes("Sales")).length || 1, icon: "building" as const },
  ], [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.description} ${job.location} ${job.skills?.join(" ")} ${job.category || ""}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
      const matchesType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;
      const matchesCategory = selectedCategory === "all" || job.category === selectedCategory || (selectedCategory === "Information Technology" && !job.category);

      let matchesTab = true;
      if (activeTab === "top") {
        matchesTab = Boolean(job.featured) || Boolean(job.salary && job.salary >= 80000);
      }

      return matchesQuery && matchesLocation && matchesType && matchesCategory && matchesTab;
    });
  }, [jobs, query, location, jobTypeFilter, selectedCategory, activeTab]);

  function loggedIn(nextUser: User) {
    setUser(nextUser);
    window.localStorage.setItem("hirehub-user", JSON.stringify(nextUser));
    setAuthOpen(false);
    setNotice(`Welcome back, ${nextUser.fullName.split(" ")[0]}.`);
  }

  async function apply(job: Job) {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    try {
      await applyForJob(job._id);
      setNotice(`Application submitted for ${job.title}!`);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Unable to apply right now.");
    }
  }

  return (
    <div className="merojob-page-wrap">
      <SiteHeader />

      <main className="merojob-main-container">
        {/* HERO BANNER SECTION (Merojob Style) */}
        <section className="merojob-hero-banner">
          <div className="hero-content-wrapper">
            <div className="hero-left-box">
              <span className="hero-eyebrow-pill">
                <span className="pulse-dot" /> NEPAL&apos;S AI-POWERED CAREER PLATFORM
              </span>

              <h1 className="hero-headline">
                Start your Success Journey <span className="highlight-text">Today</span>
              </h1>

              <p className="hero-subtext">
                Explore thousands of verified job vacancies from Nepal&apos;s premier organizations and emerging technology teams.
              </p>

              {/* Merojob Live Counters */}
              <div className="hero-counter-strip">
                <div className="counter-item">
                  <div className="counter-icon-box">
                    <Icon name="briefcase" size={18} />
                  </div>
                  <div>
                    <span className="counter-label">Live Vacancies</span>
                    <strong className="counter-val">{jobs.length > 0 ? `${jobs.length + 120}+` : "1,480+"}</strong>
                  </div>
                </div>

                <div className="counter-divider" />

                <div className="counter-item">
                  <div className="counter-icon-box">
                    <Icon name="building" size={18} />
                  </div>
                  <div>
                    <span className="counter-label">Top Employers</span>
                    <strong className="counter-val">{companies.length > 0 ? `${companies.length + 50}+` : "520+"}</strong>
                  </div>
                </div>

                <div className="counter-divider" />

                <div className="counter-item">
                  <div className="counter-icon-box">
                    <Icon name="user" size={18} />
                  </div>
                  <div>
                    <span className="counter-label">Active Seekers</span>
                    <strong className="counter-val">45,000+</strong>
                  </div>
                </div>
              </div>

              {/* Merojob Search Box */}
              <div className="merojob-search-box">
                <div className="search-field-main">
                  <Icon name="search" size={18} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by Job Title, Skill, or Keyword..."
                    className="search-input"
                  />
                </div>

                <div className="search-field-divider" />

                <div className="search-field-loc">
                  <Icon name="map" size={18} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City / Remote (e.g. Kathmandu)"
                    className="location-input"
                  />
                </div>

                <Link
                  href={`/jobs?keyword=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`}
                  className="search-submit-btn"
                >
                  <Icon name="search" size={16} />
                  <span>Search Jobs</span>
                </Link>
              </div>

              {/* Quick Filter Pills (Merojob Search Pills) */}
              <div className="search-pills-row">
                <span className="pills-label">Popular Searches:</span>
                <button
                  type="button"
                  className={`search-pill ${selectedCategory === "all" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("all")}
                >
                  All Jobs
                </button>
                <button
                  type="button"
                  className={`search-pill ${selectedCategory === "Information Technology" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("Information Technology")}
                >
                  IT &amp; Software
                </button>
                <button
                  type="button"
                  className={`search-pill ${selectedCategory === "Banking & Financial Services" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("Banking & Financial Services")}
                >
                  Banking &amp; Finance
                </button>
                <button
                  type="button"
                  className={`search-pill ${location.toLowerCase() === "kathmandu" ? "active" : ""}`}
                  onClick={() => setLocation(location ? "" : "Kathmandu")}
                >
                  Kathmandu
                </button>
                <button
                  type="button"
                  className={`search-pill ${jobTypeFilter === "full-time" ? "active" : ""}`}
                  onClick={() => setJobTypeFilter(jobTypeFilter === "full-time" ? "all" : "full-time")}
                >
                  Full-time Roles
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TOP EMPLOYERS CAROUSEL / GRID (Merojob Style) */}
        <section className="top-employers-section" id="top-employers">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">TOP RECRUITERS</span>
              <h2 className="section-main-heading">Top Employers Hiring in Nepal</h2>
            </div>
            <Link href="/jobs" className="view-all-link">
              View All Companies →
            </Link>
          </div>

          <div className="employers-marquee-grid">
            {companies.slice(0, 6).map((comp) => (
              <Link
                key={comp._id}
                href={`/jobs?keyword=${encodeURIComponent(comp.companyName)}`}
                className="employer-brand-card"
              >
                <div className="employer-logo-holder">
                  {comp.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comp.logo} alt={comp.companyName} className="employer-brand-img" />
                  ) : (
                    <div className="company-mark">{(comp.companyName || "H").slice(0, 1)}</div>
                  )}
                </div>
                <strong className="employer-card-name">{comp.companyName}</strong>
                <span className="employer-industry">{comp.industry || "Enterprise"}</span>
                <span className="employer-jobs-count">
                  {jobs.filter((j) => (typeof j.company === "object" ? j.company?._id : j.company) === comp._id).length || 2} Openings
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* JOB TABS & VACANCY SECTION (Merojob Top Jobs Tabs) */}
        <section className="jobs-board-section" id="jobs-section">
          <div className="tabs-header-wrap">
            <div className="job-tabs-list">
              <button
                type="button"
                className={`tab-btn ${activeTab === "top" ? "active" : ""}`}
                onClick={() => setActiveTab("top")}
              >
                <Icon name="spark" size={16} />
                <span>Top Jobs</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "recent" ? "active" : ""}`}
                onClick={() => setActiveTab("recent")}
              >
                <Icon name="clock" size={16} />
                <span>Recent Vacancies</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "companies" ? "active" : ""}`}
                onClick={() => setActiveTab("companies")}
              >
                <Icon name="building" size={16} />
                <span>By Organization</span>
              </button>
            </div>

            <div className="tab-controls">
              <span className="result-counter">{filteredJobs.length} roles available</span>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="type-filter-select"
              >
                <option value="all">All Employment Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="empty-state">
              <div className="loader" />
              <p>Fetching verified opportunities from database...</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <strong>Unable to connect to live jobs API.</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="empty-state">
              <strong>No matching vacancies found.</strong>
              <p>Try clearing filters or searching with different keywords.</p>
              <button
                type="button"
                className="primary-button compact"
                onClick={() => {
                  setQuery("");
                  setLocation("");
                  setSelectedCategory("all");
                  setJobTypeFilter("all");
                }}
              >
                Reset Search Filters
              </button>
            </div>
          )}

          <div className="merojob-cards-grid">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} onApply={apply} />
            ))}
          </div>

          <div className="browse-more-wrap">
            <Link href="/jobs" className="primary-button">
              Explore All {jobs.length}+ Vacancies <Icon name="arrow" size={16} />
            </Link>
          </div>
        </section>

        {/* POPULAR JOB CATEGORIES GRID (Merojob Style) */}
        <section className="categories-grid-section" id="categories">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">CAREER EXPLORATION</span>
              <h2 className="section-main-heading">Explore Jobs by Industry &amp; Function</h2>
            </div>
          </div>

          <div className="categories-card-grid">
            {categories.slice(1).map((cat) => (
              <Link
                key={cat.id}
                href={`/jobs?category=${encodeURIComponent(cat.id)}`}
                className="category-pill-card"
              >
                <div className="category-icon-box">
                  <Icon name={cat.icon} size={22} />
                </div>
                <div className="category-meta-box">
                  <strong>{cat.name}</strong>
                  <span>{cat.count} Vacancies Available</span>
                </div>
                <span className="cat-arrow">
                  <Icon name="chevronRight" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FOR EMPLOYERS CALLOUT BANNER (Merojob Employer Zone Banner) */}
        <section className="employer-zone-banner" id="for-employers">
          <div className="employer-banner-content">
            <span className="banner-badge">FOR EMPLOYERS &amp; RECRUITERS</span>
            <h2>Are You Looking to Hire Top Talent in Nepal?</h2>
            <p>
              Post your job vacancies, reach over 45,000 qualified jobseekers, and streamline your recruitment workflow with automated applicant screening.
            </p>
            <div className="employer-actions-row">
              <Link href="/recruiter" className="employer-primary-btn">
                Post a Job Vacancy <Icon name="arrow" size={15} />
              </Link>
              <Link href="/employer-zone" className="employer-ghost-btn">
                Learn About Employer Zone
              </Link>
            </div>
          </div>
          <div className="employer-stats-box">
            <div className="stat-card">
              <strong>94%</strong>
              <span>Interview Placement Rate</span>
            </div>
            <div className="stat-card">
              <strong>&lt; 48 hrs</strong>
              <span>Average Time to First Applicant</span>
            </div>
          </div>
        </section>

        {/* CAREER ADVICE & INSIGHTS (Merojob Blog / Training section) */}
        <section className="career-advice-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">CAREER ADVICE &amp; RESOURCES</span>
              <h2 className="section-main-heading">Tips to Boost Your Career</h2>
            </div>
          </div>

          <div className="advice-grid">
            <article className="advice-card">
              <span className="advice-tag">Resume Tips</span>
              <h3>How to Format a Resume for Modern Tech &amp; Corporate Companies in Nepal</h3>
              <p>Learn what hiring managers and automated applicant trackers look for in technical and management resumes.</p>
              <Link href="/jobs" className="accent-link">Read guide →</Link>
            </article>

            <article className="advice-card">
              <span className="advice-tag">Interview Prep</span>
              <h3>Top 10 Behavioral Interview Questions and How to Answer Them Confidently</h3>
              <p>Master the STAR technique and highlight your real contributions during high-stakes job interviews.</p>
              <Link href="/jobs" className="accent-link">Read guide →</Link>
            </article>

            <article className="advice-card">
              <span className="advice-tag">Salary Benchmark</span>
              <h3>Tech, Banking &amp; Design Salary Trends Across Kathmandu &amp; Lalitpur (2025)</h3>
              <p>Understand current compensation benchmarks, remote benefits, and performance bonuses.</p>
              <Link href="/jobs" className="accent-link">Read guide →</Link>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />

      {notice && (
        <button className="toast" onClick={() => setNotice("")}>
          {notice} <Icon name="close" size={14} />
        </button>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={loggedIn} />}
    </div>
  );
}
