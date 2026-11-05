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
  const [activeTab, setActiveTab] = useState<"top" | "recent" | "remote">("top");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem("hirehub-user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
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

  const categories = useMemo(
    () => [
      { id: "all", name: "All Categories", count: jobs.length, icon: "briefcase" as const },
      {
        id: "Information Technology",
        name: "IT & Telecommunications",
        count:
          jobs.filter(
            (j) =>
              j.category === "Information Technology" ||
              j.skills?.some((s) => ["React", "Node", "Python", "Cloud"].includes(s))
          ).length || 5,
        icon: "code" as const,
      },
      {
        id: "Banking & Financial Services",
        name: "Banking, Finance & Insurance",
        count: jobs.filter((j) => j.category?.includes("Banking") || j.category?.includes("Finance")).length || 3,
        icon: "dollar" as const,
      },
      {
        id: "Healthcare & Pharmaceuticals",
        name: "Healthcare & Pharmaceuticals",
        count: jobs.filter((j) => j.category?.includes("Health") || j.category?.includes("Medical")).length || 2,
        icon: "spark" as const,
      },
      {
        id: "Advertising, Design & Media",
        name: "Creative, Design & Media",
        count: jobs.filter((j) => j.category?.includes("Design") || j.category?.includes("Media")).length || 2,
        icon: "award" as const,
      },
      {
        id: "Education & Non-Profit",
        name: "Education & Non-Profit",
        count: jobs.filter((j) => j.category?.includes("Education")).length || 2,
        icon: "bookmark" as const,
      },
      {
        id: "Sales & Business Development",
        name: "Sales & Business Development",
        count: jobs.filter((j) => j.category?.includes("Sales")).length || 2,
        icon: "building" as const,
      },
    ],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.description} ${job.location} ${job.skills?.join(" ")} ${job.category || ""}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
      const matchesType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;
      const matchesCategory =
        selectedCategory === "all" ||
        job.category === selectedCategory ||
        (selectedCategory === "Information Technology" && !job.category);

      let matchesTab = true;
      if (activeTab === "top") {
        matchesTab = Boolean(job.featured) || Boolean(job.salary && job.salary >= 80000);
      } else if (activeTab === "remote") {
        matchesTab = job.location.toLowerCase().includes("remote");
      }

      return matchesQuery && matchesLocation && matchesType && matchesCategory && matchesTab;
    });
  }, [jobs, query, location, jobTypeFilter, selectedCategory, activeTab]);

  function loggedIn(nextUser: User) {
    setUser(nextUser);
    window.localStorage.setItem("hirehub-user", JSON.stringify(nextUser));
    setAuthOpen(false);
    setNotice(`Welcome back, ${nextUser.fullName.split(" ")[0]}!`);
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
        {/* HERO BANNER SECTION */}
        <section className="merojob-hero-banner">
          <div className="hero-content-wrapper">
            <span className="hero-eyebrow-pill">
              <span className="pulse-dot" /> NEPAL&apos;S PREMIER AI CAREER HUB
            </span>

            <h1 className="hero-headline">
              Start your Success Journey <span className="highlight-text">Today</span>
            </h1>

            <p className="hero-subtext">
              Explore thousands of verified vacancies from Nepal&apos;s leading tech teams, financial institutions, and fast-growing startups.
            </p>

            {/* Live Statistics Counter Strip */}
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

            {/* Multi-Criteria Search Box */}
            <div className="merojob-search-box">
              <div className="search-field-main">
                <Icon name="search" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title, technical skill, or keyword..."
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
                  placeholder="Location (e.g. Kathmandu, Remote)"
                  className="location-input"
                />
              </div>

              <Link
                href={`/jobs?keyword=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`}
                className="search-submit-btn"
              >
                <Icon name="search" size={16} />
                <span>Find Jobs</span>
              </Link>
            </div>

            {/* Quick Search Tag Pills */}
            <div className="search-pills-row">
              <span className="pills-label">Quick Filters:</span>
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
                className={`search-pill ${location.toLowerCase() === "remote" ? "active" : ""}`}
                onClick={() => setLocation(location ? "" : "Remote")}
              >
                Remote
              </button>
            </div>
          </div>
        </section>

        {/* TOP VERIFIED EMPLOYERS */}
        <section className="top-employers-section" id="top-employers">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">TOP RECRUITERS</span>
              <h2 className="section-main-heading">Leading Employers Hiring in Nepal</h2>
            </div>
            <Link href="/jobs" className="accent-link">
              Browse All Companies →
            </Link>
          </div>

          <div className="employers-grid">
            {companies.slice(0, 6).map((comp) => {
              const openingsCount =
                jobs.filter((j) => (typeof j.company === "object" ? j.company?._id : j.company) === comp._id).length ||
                2;
              return (
                <Link
                  key={comp._id}
                  href={`/jobs?keyword=${encodeURIComponent(comp.companyName)}`}
                  className="employer-card-box"
                >
                  <div className="employer-logo-frame">
                    {comp.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={comp.logo} alt={comp.companyName} className="employer-logo-img" />
                    ) : (
                      <div className="company-mark">{(comp.companyName || "H").slice(0, 1)}</div>
                    )}
                  </div>
                  <h3 className="employer-title-text">{comp.companyName}</h3>
                  <span className="employer-vacancies-count">{openingsCount} Active Vacancies</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* TABBED JOB DIRECTORY */}
        <section className="job-tabs-container" id="vacancies">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">CURATED VACANCIES</span>
              <h2 className="section-main-heading">Featured Career Opportunities</h2>
            </div>
            <Link href="/jobs" className="accent-link">
              View All {jobs.length}+ Vacancies →
            </Link>
          </div>

          <div className="job-tab-nav">
            <button
              type="button"
              className={`tab-btn ${activeTab === "top" ? "active" : ""}`}
              onClick={() => setActiveTab("top")}
            >
              <Icon name="spark" size={16} />
              <span>Top Jobs</span>
              <span className="tab-count-pill">Hot</span>
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
              className={`tab-btn ${activeTab === "remote" ? "active" : ""}`}
              onClick={() => setActiveTab("remote")}
            >
              <Icon name="map" size={16} />
              <span>Remote Roles</span>
            </button>
          </div>

          {/* Quick Category Filter Sub-bar */}
          <div className="category-filter-subbar">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-filter-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading && (
            <div className="empty-state">
              <div className="loader" />
              <p>Fetching verified opportunities from database...</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <strong>Unable to load vacancies.</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="empty-state">
              <strong>No matching vacancies found.</strong>
              <p>Try adjusting your search criteria or resetting filters.</p>
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

          <div className="job-cards-grid">
            {filteredJobs.slice(0, 6).map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={apply}
                isSavedInitial={Boolean(user?.profile?.savedJobs?.includes(job._id))}
              />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "36px" }}>
            <Link href="/jobs" className="primary-button">
              Explore All {jobs.length}+ Vacancies in Nepal <Icon name="arrow" size={15} />
            </Link>
          </div>
        </section>

        {/* POPULAR CATEGORIES GRID */}
        <section className="popular-categories-section" id="categories">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">CAREER SECTORS</span>
              <h2 className="section-main-heading">Explore by Industry &amp; Function</h2>
            </div>
          </div>

          <div className="categories-grid">
            {categories.slice(1).map((cat) => (
              <Link
                key={cat.id}
                href={`/jobs?category=${encodeURIComponent(cat.id)}`}
                className="category-card"
              >
                <div className="category-card-left">
                  <div className="category-icon-box">
                    <Icon name={cat.icon} size={22} />
                  </div>
                  <div>
                    <h3 className="category-title">{cat.name}</h3>
                    <span className="category-count">{cat.count} Vacancies Available</span>
                  </div>
                </div>
                <span className="category-arrow">
                  <Icon name="chevronRight" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* EMPLOYER CALLOUT BANNER */}
        <section className="employer-callout-banner">
          <div className="employer-callout-content">
            <span className="eyebrow-accent" style={{ color: "var(--lime)" }}>
              FOR EMPLOYERS &amp; HR LEADERS
            </span>
            <h2>Are You Looking to Hire Top Talent in Nepal?</h2>
            <p>
              Reach over 45,000+ active candidates. Post vacancies, filter verified applicants, and streamline your recruitment with intelligent matching tools.
            </p>
          </div>
          <div className="employer-callout-actions">
            <Link href="/recruiter" className="primary-button">
              Post a Vacancy <Icon name="arrow" size={15} />
            </Link>
            <Link href="/employer-zone" className="secondary-button">
              Employer Zone
            </Link>
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
