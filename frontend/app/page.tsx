"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthModal } from "@/src/components/AuthModal";
import { Icon } from "@/src/components/Icon";
import { JobCard } from "@/src/components/JobCard";
import { applyForJob, getJobs, logoutUser } from "@/src/lib/api";
import type { Job, User } from "@/src/types";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("hirehub-user");
    return stored ? JSON.parse(stored) as User : null;
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load jobs."))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const haystack = `${job.title} ${job.description} ${job.location} ${job.skills?.join(" ")}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) &&
      (!location || job.location.toLowerCase().includes(location.toLowerCase())) &&
      (type === "all" || job.jobType === type);
  }), [jobs, location, query, type]);

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
      setNotice(`Application sent for ${job.title}.`);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Unable to apply right now.");
    }
  }

  async function logout() {
    await logoutUser().catch(() => undefined);
    setUser(null);
    window.localStorage.removeItem("hirehub-user");
    setNotice("You have been signed out.");
  }

  return (
    <main>
      <nav className="nav-shell">
        <a className="brand" href="#"><span className="logo-mark">H</span><span>hire<span className="brand-accent">hub</span></span></a>
        <div className="nav-links"><a href="#jobs">Explore jobs</a><a href="#how-it-works">How it works</a><a href="#companies">For companies</a></div>
        <div className="nav-actions">
          {user ? <><span className="user-greeting">Hi, {user.fullName.split(" ")[0]}</span><button className="text-button" onClick={logout}><Icon name="logout" size={16} /> Sign out</button></> :
            <><button className="login-button" onClick={() => setAuthOpen(true)}>Sign in</button><button className="primary-button compact" onClick={() => setAuthOpen(true)}>Get started <Icon name="arrow" size={15} /></button></>}
        </div>
        <button className="icon-button mobile-menu" aria-label="Open menu"><Icon name="menu" /></button>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="pill"><span className="pulse" /> The smarter way to build your career</div>
          <h1>Do work that<br /><em>means more.</em></h1>
          <p>Discover opportunities with companies that value your talent, your ambition, and your next big idea.</p>
          <div className="hero-actions"><a className="primary-button" href="#jobs">Explore opportunities <Icon name="arrow" size={17} /></a><a className="secondary-button" href="#how-it-works">See how it works <Icon name="arrow" size={16} /></a></div>
          <div className="trust-row"><div className="avatar-stack"><span>JD</span><span>AM</span><span>SK</span><span>+</span></div><p><strong>12,000+</strong> people found their fit this month</p></div>
        </div>
        <div className="hero-art" aria-label="Career growth illustration">
          <div className="art-glow" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="art-card card-main"><div className="mini-logo">H</div><span className="eyebrow">YOUR NEXT MOVE</span><strong>Find work that<br /><span>fits your life.</span></strong><div className="sparkle">✦</div></div>
          <div className="art-card card-float"><span className="check-circle"><Icon name="check" size={14} /></span><div><strong>New opportunity</strong><small>Product Designer · Remote</small></div></div>
          <div className="art-stat"><strong>94%</strong><span>candidate<br />satisfaction</span></div>
        </div>
      </section>

      <section className="search-wrap" id="jobs">
        <div className="search-box"><Icon name="search" size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Job title, skill, or keyword" /><span className="search-divider" /><Icon name="map" size={19} /><input className="location-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or remote" /><button className="primary-button search-button">Search jobs</button></div>
      </section>

      <section className="jobs-section">
        <div className="section-heading"><div><p className="eyebrow">Curated for you</p><h2>Opportunities worth<br /><em>moving for.</em></h2></div><div className="job-controls"><span>{filteredJobs.length} roles available</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All job types</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div></div>
        {loading && <div className="empty-state"><div className="loader" />Loading fresh opportunities...</div>}
        {!loading && error && <div className="empty-state"><strong>We couldn&apos;t reach the job board.</strong><p>{error} Make sure the backend is running on port 8000.</p></div>}
        {!loading && !error && filteredJobs.length === 0 && <div className="empty-state"><strong>No roles match your search.</strong><p>Try a different keyword, location, or job type.</p></div>}
        <div className="jobs-grid">{filteredJobs.map((job) => <JobCard key={job._id} job={job} onApply={apply} />)}</div>
      </section>

      <section className="how-section" id="how-it-works"><p className="eyebrow">Simple by design</p><h2>A better way to find<br /><em>your next chapter.</em></h2><div className="steps"><div><span>01</span><h3>Tell us what matters</h3><p>Set your goals, preferences, and the kind of work that energizes you.</p></div><div><span>02</span><h3>Meet your match</h3><p>Explore relevant roles from thoughtful teams that are hiring now.</p></div><div><span>03</span><h3>Make your move</h3><p>Apply with confidence and take the next step in your story.</p></div></div></section>
      <footer><a className="brand" href="#"><span className="logo-mark">H</span><span>hire<span className="brand-accent">hub</span></span></a><p>Work, with purpose.</p><span>© 2025 HireHub</span></footer>
      {notice && <button className="toast" onClick={() => setNotice("")}>{notice} <Icon name="close" size={14} /></button>}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={loggedIn} />}
    </main>
  );
}
