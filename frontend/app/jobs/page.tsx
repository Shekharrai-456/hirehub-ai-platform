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
  const [sortBy, setSortBy] = useState<"latest" | "salary" | "title">("latest");
  const [notice, setNotice] = useState("");
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
        selectedLevel === "All" || selectedLevel === "all" || (job.position && job.position.toLowerCase().includes(selectedLevel.toLowerCase()));

      return matchKeyword && matchLoc && matchCat && matchType && matchLevel;
    });

    return list.sort((a, b) => {
      if (sortBy === "salary") return (b.salary || 0) - (a.salary || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      // latest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [jobs, keyword, selectedLocation, selectedCategory, selectedType, selectedLevel, sortBy]);

  function clearAllFilters() {
    setKeyword("");
    setSelectedLocation("All");
    setSelectedCategory("All");
    setSelectedType("All");
    setSelectedLevel("All");
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
          <p className="eyebrow-accent">DISCOVER VACANCIES</p>
          <h1>Find Job Vacancies in Nepal</h1>
          <p>Search over {jobs.length || "1,200"}+ active openings across top organizations, startups, and institutions.</p>

          <div className="search-top-bar">
            <div className="search-top-input-box">
              <Icon name="search" size={18} />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, technical skill, or company name..."
              />
            </div>
            <button
              type="button"
              className="primary-button compact"
              onClick={() => {}}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Faceted Filters Sidebar + Results */}
      <div className="search-columns-wrap">
        {/* Left Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="sidebar-header-row">
            <div className="sidebar-title">
              <Icon name="filter" size={16} />
              <h3>Filter Jobs</h3>
            </div>
            <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>

          {/* Job Level Accordion */}
          <div className="filter-group">
            <h4 className="filter-group-title">Job Level</h4>
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

          {/* Job Location */}
          <div className="filter-group">
            <h4 className="filter-group-title">Job Location</h4>
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

          {/* Categories / Function */}
          <div className="filter-group">
            <h4 className="filter-group-title">Job Categories</h4>
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
        </aside>

        {/* Right Search Results */}
        <section className="search-results-main">
          <div className="results-toolbar">
            <div className="results-count-summary">
              <h2>
                <strong>{filteredJobs.length}</strong> Vacancies Found
              </h2>
              {(keyword || selectedLocation !== "All" || selectedCategory !== "All" || selectedType !== "All") && (
                <div className="active-chips-row">
                  {keyword && (
                    <span className="filter-chip" onClick={() => setKeyword("")}>
                      &quot;{keyword}&quot; <Icon name="close" size={12} />
                    </span>
                  )}
                  {selectedLocation !== "All" && selectedLocation && (
                    <span className="filter-chip" onClick={() => setSelectedLocation("All")}>
                      Location: {selectedLocation} <Icon name="close" size={12} />
                    </span>
                  )}
                  {selectedCategory !== "All" && selectedCategory !== "all" && selectedCategory && (
                    <span className="filter-chip" onClick={() => setSelectedCategory("All")}>
                      {selectedCategory} <Icon name="close" size={12} />
                    </span>
                  )}
                  {selectedType !== "All" && (
                    <span className="filter-chip" onClick={() => setSelectedType("All")}>
                      Type: {selectedType} <Icon name="close" size={12} />
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="sort-controls">
              <label>Sort by:</label>
              <select
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

          {loading && (
            <div className="empty-state">
              <div className="loader" />
              <p>Loading vacancies from database...</p>
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="empty-state">
              <strong>No matching vacancies found.</strong>
              <p>We couldn&apos;t find any roles matching your current filter criteria.</p>
              <button type="button" className="primary-button compact" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}

          <div className="search-cards-list">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} onApply={apply} />
            ))}
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
