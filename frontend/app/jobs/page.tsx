"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { JobCard } from "@/src/components/JobCard";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { applyForJob, getJobs } from "@/src/lib/api";
import type { Job, User } from "@/src/types";

function JobsSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [minSalary, setMinSalary] = useState(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "salary" | "title">("latest");
  const [notice, setNotice] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
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
    getJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  const locationsList = ["All", "Kathmandu", "Lalitpur", "Biratnagar", "Remote"];
  const categoriesList = [
    "All",
    "Information Technology",
    "Banking & Financial Services",
    "Healthcare & Pharmaceuticals",
    "Advertising, Design & Media",
    "Education & Non-Profit",
    "Sales & Business Development",
    "Telecommunications & ISP",
  ];
  const typesList = ["All", "full-time", "part-time", "contract", "internship"];
  const levelsList = ["All", "Senior Level", "Mid Level", "Entry Level"];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedLocation && selectedLocation !== "All") count++;
    if (selectedCategory && selectedCategory !== "All" && selectedCategory !== "all") count++;
    if (selectedType && selectedType !== "All" && selectedType !== "all") count++;
    if (selectedLevel && selectedLevel !== "All" && selectedLevel !== "all") count++;
    if (minSalary > 0) count++;
    if (remoteOnly) count++;
    return count;
  }, [selectedLocation, selectedCategory, selectedType, selectedLevel, minSalary, remoteOnly]);

  const filteredJobs = useMemo(() => {
    const list = jobs.filter((job) => {
      const text = `${job.title} ${job.description} ${job.location} ${job.skills?.join(" ")} ${job.category || ""}`.toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword.toLowerCase());
      const matchLoc =
        selectedLocation === "All" ||
        !selectedLocation ||
        job.location.toLowerCase().includes(selectedLocation.toLowerCase());
      const matchCat =
        selectedCategory === "All" ||
        selectedCategory === "all" ||
        !selectedCategory ||
        job.category === selectedCategory ||
        (!job.category && selectedCategory === "Information Technology");
      const matchType = selectedType === "All" || selectedType === "all" || job.jobType === selectedType;
      const matchLevel =
        selectedLevel === "All" ||
        selectedLevel === "all" ||
        (job.position && job.position.toLowerCase().includes(selectedLevel.toLowerCase()));
      const matchSalary = !minSalary || (job.salary && job.salary >= minSalary);
      const matchRemote = !remoteOnly || job.location.toLowerCase().includes("remote");

      return matchKeyword && matchLoc && matchCat && matchType && matchLevel && matchSalary && matchRemote;
    });

    return list.sort((a, b) => {
      if (sortBy === "salary") return (b.salary || 0) - (a.salary || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [jobs, keyword, selectedLocation, selectedCategory, selectedType, selectedLevel, minSalary, remoteOnly, sortBy]);

  function clearAllFilters() {
    setKeyword("");
    setSelectedLocation("All");
    setSelectedCategory("All");
    setSelectedType("All");
    setSelectedLevel("All");
    setMinSalary(0);
    setRemoteOnly(false);
  }

  async function apply(job: Job) {
    if (!user) {
      router.push(`/login?redirect=/jobs/${job._id}`);
      return;
    }
    try {
      await applyForJob(job._id);
      setNotice(`Application sent for ${job.title}!`);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Unable to apply right now.");
    }
  }

  return (
    <div className="search-page-layout">
      {/* Search Header Banner */}
      <section className="search-page-header">
        <div className="search-header-inner">
          <span className="hero-eyebrow-pill" style={{ marginBottom: "12px" }}>
            <span className="pulse-dot" /> VERIFIED VACANCIES IN NEPAL
          </span>
          <h1>Find Your Next Career Move</h1>
          <p>
            Connect directly with verified tech companies, financial institutions, and fast-growing teams across Nepal.
          </p>

          <div className="search-top-bar">
            <div className="search-top-input-box">
              <Icon name="search" size={18} />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search job title, technical skill, or organization..."
              />
            </div>
            {keyword && (
              <button
                type="button"
                className="icon-button"
                onClick={() => setKeyword("")}
                title="Clear keyword"
              >
                <Icon name="close" size={14} />
              </button>
            )}
            <button
              type="button"
              className="primary-button compact"
              onClick={() => {}}
            >
              Search Jobs
            </button>
          </div>

          {/* Quick Filters Row */}
          <div className="search-pills-row" style={{ marginTop: "16px" }}>
            <span className="pills-label">Quick Filters:</span>
            <button
              type="button"
              className={`search-pill ${remoteOnly ? "active" : ""}`}
              onClick={() => setRemoteOnly(!remoteOnly)}
            >
              Remote Only
            </button>
            <button
              type="button"
              className={`search-pill ${selectedLocation === "Kathmandu" ? "active" : ""}`}
              onClick={() => setSelectedLocation(selectedLocation === "Kathmandu" ? "All" : "Kathmandu")}
            >
              Kathmandu
            </button>
            <button
              type="button"
              className={`search-pill ${selectedCategory === "Information Technology" ? "active" : ""}`}
              onClick={() =>
                setSelectedCategory(selectedCategory === "Information Technology" ? "All" : "Information Technology")
              }
            >
              IT &amp; Software
            </button>
            <button
              type="button"
              className={`search-pill ${minSalary === 80000 ? "active" : ""}`}
              onClick={() => setMinSalary(minSalary === 80000 ? 0 : 80000)}
            >
              Rs. 80,000+
            </button>
            <button
              type="button"
              className={`search-pill ${selectedType === "full-time" ? "active" : ""}`}
              onClick={() => setSelectedType(selectedType === "full-time" ? "All" : "full-time")}
            >
              Full-time
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Filter Toggle Button */}
      <button
        type="button"
        className="mobile-filter-trigger"
        onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Icon name="filter" size={16} />
          <strong>Filter Vacancies</strong>
          {activeFilterCount > 0 && (
            <span className="tab-count-pill" style={{ background: "var(--brand-tint)", color: "var(--brand)" }}>
              {activeFilterCount} active
            </span>
          )}
        </span>
        <Icon name={mobileFilterOpen ? "close" : "chevronDown"} size={16} />
      </button>

      {/* Two Column Layout: Faceted Filters Sidebar + Results */}
      <div className="search-columns-wrap">
        {/* Left Filters Sidebar */}
        <aside className={`filters-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-header-row">
            <div className="sidebar-title">
              <Icon name="filter" size={16} />
              <h3>Filters</h3>
              {activeFilterCount > 0 && (
                <span className="tab-count-pill" style={{ background: "var(--brand-tint)", color: "var(--brand)" }}>
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>
              Reset All
            </button>
          </div>

          {/* Remote Only Switch */}
          <div className="filter-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--surface-subtle)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>
                Remote Roles Only
              </span>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                style={{ accentColor: "var(--brand)", width: "16px", height: "16px" }}
              />
            </label>
          </div>

          {/* Career Level */}
          <div className="filter-group">
            <h4 className="filter-group-title">Career Level</h4>
            <div className="filter-options-list">
              {levelsList.map((lvl) => (
                <label key={lvl} className="filter-option-label">
                  <input
                    type="radio"
                    name="level"
                    checked={selectedLevel === lvl}
                    onChange={() => setSelectedLevel(lvl)}
                  />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div className="filter-group">
            <h4 className="filter-group-title">Employment Type</h4>
            <div className="filter-options-list">
              {typesList.map((t) => (
                <label key={t} className="filter-option-label">
                  <input
                    type="radio"
                    name="type"
                    checked={selectedType === t}
                    onChange={() => setSelectedType(t)}
                  />
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary Expectations */}
          <div className="filter-group">
            <h4 className="filter-group-title">Minimum Salary</h4>
            <div className="filter-options-list">
              {[
                { label: "Any Salary", val: 0 },
                { label: "Rs. 30,000+", val: 30000 },
                { label: "Rs. 60,000+", val: 60000 },
                { label: "Rs. 90,000+", val: 90000 },
                { label: "Rs. 120,000+", val: 120000 },
              ].map((s) => (
                <label key={s.val} className="filter-option-label">
                  <input
                    type="radio"
                    name="salary"
                    checked={minSalary === s.val}
                    onChange={() => setMinSalary(s.val)}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="filter-group">
            <h4 className="filter-group-title">Location</h4>
            <div className="filter-options-list">
              {locationsList.map((loc) => (
                <label key={loc} className="filter-option-label">
                  <input
                    type="radio"
                    name="location"
                    checked={selectedLocation === loc}
                    onChange={() => setSelectedLocation(loc)}
                  />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="filter-group">
            <h4 className="filter-group-title">Industry Category</h4>
            <div className="filter-options-list scrollable">
              {categoriesList.map((cat) => (
                <label key={cat} className="filter-option-label">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {mobileFilterOpen && (
            <div style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="primary-button full-width"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply &amp; Show {filteredJobs.length} Results
              </button>
            </div>
          )}
        </aside>

        {/* Right Search Results */}
        <section className="search-results-main">
          <div className="results-toolbar">
            <div className="results-count-summary">
              <h2>
                Showing <strong>{filteredJobs.length}</strong> Vacancies
              </h2>
              {(keyword ||
                (selectedLocation !== "All" && selectedLocation) ||
                (selectedCategory !== "All" && selectedCategory !== "all") ||
                selectedType !== "All" ||
                minSalary > 0 ||
                remoteOnly) && (
                <div className="active-chips-row">
                  {keyword && (
                    <span className="filter-chip" onClick={() => setKeyword("")}>
                      &quot;{keyword}&quot; <Icon name="close" size={12} />
                    </span>
                  )}
                  {selectedLocation !== "All" && selectedLocation && (
                    <span className="filter-chip" onClick={() => setSelectedLocation("All")}>
                      {selectedLocation} <Icon name="close" size={12} />
                    </span>
                  )}
                  {selectedCategory !== "All" && selectedCategory !== "all" && selectedCategory && (
                    <span className="filter-chip" onClick={() => setSelectedCategory("All")}>
                      {selectedCategory} <Icon name="close" size={12} />
                    </span>
                  )}
                  {selectedType !== "All" && (
                    <span className="filter-chip" onClick={() => setSelectedType("All")}>
                      {selectedType} <Icon name="close" size={12} />
                    </span>
                  )}
                  {minSalary > 0 && (
                    <span className="filter-chip" onClick={() => setMinSalary(0)}>
                      Rs. {minSalary.toLocaleString()}+ <Icon name="close" size={12} />
                    </span>
                  )}
                  {remoteOnly && (
                    <span className="filter-chip" onClick={() => setRemoteOnly(false)}>
                      Remote Only <Icon name="close" size={12} />
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="sort-controls">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "latest" | "salary" | "title")}
                className="sort-select"
              >
                <option value="latest">Most Recent</option>
                <option value="salary">Highest Salary</option>
                <option value="title">Job Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Shimmer Skeleton Cards Loading State */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card">
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div className="skeleton-box" style={{ width: "48px", height: "48px", borderRadius: "12px" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div className="skeleton-box" style={{ width: "45%", height: "18px" }} />
                      <div className="skeleton-box" style={{ width: "25%", height: "13px" }} />
                    </div>
                  </div>
                  <div className="skeleton-box" style={{ width: "85%", height: "14px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px" }}>
                    <div className="skeleton-box" style={{ width: "30%", height: "18px" }} />
                    <div className="skeleton-box" style={{ width: "22%", height: "32px", borderRadius: "8px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="empty-state">
              <Icon name="briefcase" size={36} />
              <strong>No matching vacancies found.</strong>
              <p>Try broadening your filters or searching with different keywords.</p>
              <button type="button" className="primary-button compact" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}

          <div className="search-cards-list">
            {filteredJobs.map((job) => {
              const isSaved = Boolean(user?.profile?.savedJobs?.includes(job._id));
              return (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={apply}
                  isSavedInitial={isSaved}
                />
              );
            })}
          </div>
        </section>
      </div>

      {notice && (
        <button className="toast" onClick={() => setNotice("")}>
          {notice} <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="empty-state"><div className="loader" /></div>}>
        <JobsSearchContent />
      </Suspense>
    </PageShell>
  );
}
