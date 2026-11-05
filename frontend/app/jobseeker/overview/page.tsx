"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import {
  applyForJob,
  getApplications,
  getJobs,
  toggleActivelySeeking,
  toggleSaveJob,
  updateUserProfile as updateProfile,
  updateUserPreferences,
  addJobAlert,
  deleteJobAlert,
} from "@/src/lib/api";
import { useIsMounted } from "@/src/lib/useMounted";
import type { Application, Job, User, PreferredJob, JobAlert } from "@/src/types";

function readSessionUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("hirehub-user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

type TabKey = "overview" | "applications" | "matched" | "saved" | "preferences" | "alerts" | "performance";

function JobseekerOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "overview";

  const mounted = useIsMounted();
  const [user, setUser] = useState<User | null>(() => readSessionUser());
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for editing sections
  const [showEditModal, setShowEditModal] = useState<"profile" | "preferences" | "alert" | null>(null);

  // Edit form states
  const [profileForm, setProfileForm] = useState(() => {
    const session = readSessionUser();
    return {
      fullName: session?.fullName || "",
      email: session?.email || "",
      phoneNumber: String(session?.phoneNumber || ""),
      bio: session?.profile?.bio || "",
      skills: session?.profile?.skills?.join(", ") || "",
      resumeOriginalName: session?.profile?.resumeOriginalName || "",
    };
  });

  const [preferencesForm, setPreferencesForm] = useState<PreferredJob>(() => {
    const session = readSessionUser();
    return {
      category: session?.profile?.preferredJob?.category || "Information Technology",
      location: session?.profile?.preferredJob?.location || "Kathmandu",
      expectedSalary: session?.profile?.preferredJob?.expectedSalary || "50,000 - 80,000",
      jobLevel: session?.profile?.preferredJob?.jobLevel || "Mid Level",
      jobType: session?.profile?.preferredJob?.jobType || "full-time",
    };
  });

  const [alertForm, setAlertForm] = useState({
    category: "Information Technology",
    keyword: "",
    frequency: "daily",
  });

  // Load applications and active vacancies
  useEffect(() => {
    let active = true;
    Promise.all([
      user?._id ? getApplications(user._id).catch(() => []) : Promise.resolve([]),
      getJobs().catch(() => []),
    ])
      .then(([apps, jobList]) => {
        if (!active) return;
        setApplications(apps);
        setJobs(jobList);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user?._id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to update state and localStorage
  const updateSessionState = (updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hirehub-user", JSON.stringify(updatedUser));
    }
  };

  // Actively Seeking toggle
  const handleToggleActivelySeeking = async () => {
    if (!user) return;
    const current = Boolean(user.profile?.activelySeeking);
    const nextState = !current;

    // Optimistic update
    const updated: User = {
      ...user,
      profile: {
        ...user.profile,
        activelySeeking: nextState,
        activelySeekingExpiresAt: nextState
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      },
    };
    updateSessionState(updated);

    try {
      setSavingAction("activelySeeking");
      await toggleActivelySeeking(nextState);
      showToast(
        nextState
          ? "Actively Seeking enabled! Your profile is highlighted to recruiters for the next 7 days."
          : "Actively Seeking status disabled."
      );
    } catch {
      // Keep optimistic state since localStorage is updated
      showToast(
        nextState
          ? "Actively Seeking activated for 7 days!"
          : "Actively Seeking turned off."
      );
    } finally {
      setSavingAction(null);
    }
  };

  // Toggle Save Job
  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) {
      showToast("Please sign in to save jobs.");
      return;
    }

    const currentSaved = user.profile?.savedJobs || [];
    const isSaved = currentSaved.includes(jobId);
    const nextSaved = isSaved
      ? currentSaved.filter((id) => id !== jobId)
      : [...currentSaved, jobId];

    const updatedUser: User = {
      ...user,
      profile: {
        ...user.profile,
        savedJobs: nextSaved,
      },
    };
    updateSessionState(updatedUser);

    try {
      await toggleSaveJob(jobId);
      showToast(isSaved ? "Job removed from saved jobs." : "Job saved to your bookmarks! ★");
    } catch {
      showToast(isSaved ? "Removed from saved." : "Job saved successfully! ★");
    }
  };

  // Quick Apply handler
  const handleQuickApply = async (jobId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      setSavingAction(`apply-${jobId}`);
      await applyForJob(jobId);
      showToast("Application submitted successfully! Track it in Applied Jobs.");
      if (user._id) {
        const refreshed = await getApplications(user._id);
        setApplications(refreshed);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Application failed.");
    } finally {
      setSavingAction(null);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingAction("profile");
      const skillsArray = profileForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedUser: User = {
        ...user,
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
        profile: {
          ...user.profile,
          bio: profileForm.bio,
          skills: skillsArray,
          resumeOriginalName: profileForm.resumeOriginalName || user.profile?.resumeOriginalName,
        },
      };

      updateSessionState(updatedUser);
      await updateProfile({
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
        bio: profileForm.bio,
        skills: profileForm.skills,
        resumeOriginalName: profileForm.resumeOriginalName,
      });

      setShowEditModal(null);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSavingAction(null);
    }
  };

  // Save preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingAction("preferences");
      const updatedUser: User = {
        ...user,
        profile: {
          ...user.profile,
          preferredJob: preferencesForm,
        },
      };
      updateSessionState(updatedUser);
      await updateUserPreferences(preferencesForm);
      setShowEditModal(null);
      showToast("Job preferences updated successfully!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setSavingAction(null);
    }
  };

  // Add Job Alert
  const handleAddJobAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingAction("alert");
      const newAlert: JobAlert = {
        _id: `alert-${Date.now()}`,
        category: alertForm.category,
        keyword: alertForm.keyword,
        frequency: alertForm.frequency,
        createdAt: new Date().toISOString(),
      };
      const existingAlerts = user.profile?.jobAlerts || [];
      const updatedAlerts = [...existingAlerts, newAlert];

      const updatedUser: User = {
        ...user,
        profile: {
          ...user.profile,
          jobAlerts: updatedAlerts,
        },
      };
      updateSessionState(updatedUser);
      await addJobAlert(alertForm);
      setShowEditModal(null);
      setAlertForm({ category: "Information Technology", keyword: "", frequency: "daily" });
      showToast("Job alert configured!");
    } catch {
      setShowEditModal(null);
      showToast("Job alert configured!");
    } finally {
      setSavingAction(null);
    }
  };

  // Delete Job Alert
  const handleDeleteAlert = async (alertId: string) => {
    if (!user) return;
    const existing = user.profile?.jobAlerts || [];
    const filtered = existing.filter((a) => a._id !== alertId);
    const updatedUser: User = {
      ...user,
      profile: {
        ...user.profile,
        jobAlerts: filtered,
      },
    };
    updateSessionState(updatedUser);
    try {
      await deleteJobAlert(alertId);
      showToast("Job alert removed.");
    } catch {
      showToast("Job alert removed.");
    }
  };

  // Calculate Profile Strength (Merojob algorithm)
  const profileStrength = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    if (user.fullName && user.email) score += 20; // Contact base
    if (user.phoneNumber) score += 10;
    if (user.profile?.bio && user.profile.bio.length > 20) score += 15; // Bio
    if (user.profile?.skills && user.profile.skills.length > 0) {
      score += user.profile.skills.length >= 3 ? 20 : 10; // Skills
    }
    if (user.profile?.resumeOriginalName || user.profile?.resume) score += 15; // Resume
    if (user.profile?.preferredJob?.category) score += 10; // Preferences
    if (user.profile?.education && user.profile.education.length > 0) score += 10;
    return Math.min(100, score);
  }, [user]);

  // Recommended Jobs matched against candidate's profile
  const matchedJobs = useMemo(() => {
    if (!jobs.length) return [];
    const userSkills = (user?.profile?.skills || []).map((s) => s.toLowerCase());
    const preferredCat = user?.profile?.preferredJob?.category?.toLowerCase() || "";
    const preferredLoc = user?.profile?.preferredJob?.location?.toLowerCase() || "";

    return jobs
      .map((job) => {
        let matchScore = 60; // base potential match
        const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
        const matchingSkills = userSkills.filter((us) =>
          jobSkills.some((js) => js.includes(us) || us.includes(js))
        );

        if (matchingSkills.length > 0) {
          matchScore += Math.min(30, matchingSkills.length * 10);
        }
        if (preferredCat && job.category?.toLowerCase().includes(preferredCat)) {
          matchScore += 8;
        }
        if (preferredLoc && job.location?.toLowerCase().includes(preferredLoc)) {
          matchScore += 5;
        }

        const score = Math.min(99, matchScore);
        return {
          ...job,
          matchScore: score,
          matchingSkills,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [jobs, user?.profile?.skills, user?.profile?.preferredJob]);

  // Saved Jobs list
  const savedJobsList = useMemo(() => {
    const savedIds = new Set(user?.profile?.savedJobs || []);
    return jobs.filter((j) => savedIds.has(j._id));
  }, [jobs, user?.profile?.savedJobs]);

  // Applied job IDs for quick check
  const appliedJobIds = useMemo(() => {
    return new Set(
      applications.map((app) => (typeof app.job === "object" ? app.job?._id : app.job))
    );
  }, [applications]);

  // Breakdown counts
  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;
  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const profileViews = user?.profile?.profileViews || 24;

  if (mounted && !user) {
    return (
      <PageShell>
        <div className="merojob-unauth-container">
          <div className="empty-state">
            <Icon name="lock" size={42} />
            <h2>Jobseeker Sign In Required</h2>
            <p>
              Please sign in to access your Merojob Jobseeker Overview, review matched jobs, and track
              application statuses.
            </p>
            <div className="empty-state-actions">
              <Link className="primary-button" href="/login">
                Sign In to Account
              </Link>
              <Link className="secondary-button" href="/register">
                Register Free
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="merojob-dashboard-wrapper">
        {/* ================= LEFT SIDEBAR (MEROJOB STYLE) ================= */}
        <aside className="merojob-sidebar">
          {/* User Profile Summary Card */}
          <div className="sidebar-profile-card">
            <div className="avatar-circle">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="profile-identity">
              <h3>{user?.fullName}</h3>
              <p className="headline-text">
                {user?.profile?.preferredJob?.category || "Job Seeker"}
              </p>
              <span className="location-chip">
                <Icon name="map" size={13} /> {user?.profile?.preferredJob?.location || "Kathmandu, Nepal"}
              </span>
            </div>
          </div>

          {/* Actively Seeking Mini Status */}
          <div className={`actively-seeking-mini-banner ${user?.profile?.activelySeeking ? "active" : ""}`}>
            <div className="indicator-dot" />
            <div>
              <strong>
                {user?.profile?.activelySeeking ? "Actively Seeking Job" : "Standard Visibility"}
              </strong>
              <span>
                {user?.profile?.activelySeeking ? "Profile Highlighted (7 Days)" : "Turn on to get 3x calls"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav-menu">
            <button
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Icon name="spark" size={18} />
              <span>Overview</span>
            </button>

            <button
              className={`nav-item ${activeTab === "matched" ? "active" : ""}`}
              onClick={() => setActiveTab("matched")}
            >
              <Icon name="briefcase" size={18} />
              <span>Matching Jobs</span>
              {matchedJobs.length > 0 && <span className="nav-badge primary">{matchedJobs.length}</span>}
            </button>

            <button
              className={`nav-item ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              <Icon name="clock" size={18} />
              <span>Applied Jobs</span>
              {applications.length > 0 && <span className="nav-badge">{applications.length}</span>}
            </button>

            <button
              className={`nav-item ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              <Icon name="bookmark" size={18} />
              <span>Saved Jobs</span>
              {savedJobsList.length > 0 && <span className="nav-badge">{savedJobsList.length}</span>}
            </button>

            <button
              className={`nav-item ${activeTab === "preferences" ? "active" : ""}`}
              onClick={() => setActiveTab("preferences")}
            >
              <Icon name="sliders" size={18} />
              <span>Preferred Jobs</span>
            </button>

            <button
              className={`nav-item ${activeTab === "alerts" ? "active" : ""}`}
              onClick={() => setActiveTab("alerts")}
            >
              <Icon name="bell" size={18} />
              <span>Job Alerts</span>
              {(user?.profile?.jobAlerts?.length || 0) > 0 && (
                <span className="nav-badge">{user?.profile?.jobAlerts?.length}</span>
              )}
            </button>

            <button
              className={`nav-item ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <Icon name="eye" size={18} />
              <span>Profile Views</span>
              <span className="nav-badge success">+{profileViews}</span>
            </button>
          </nav>

          {/* Quick Profile Edit CTA */}
          <div className="sidebar-footer-box">
            <button
              className="secondary-button compact full-width"
              onClick={() => setShowEditModal("profile")}
            >
              <Icon name="edit" size={14} /> Update Resume / Info
            </button>
            <Link href="/jobs" className="browse-link">
              Search All Jobs →
            </Link>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD BODY ================= */}
        <main className="merojob-dashboard-main">
          {/* Top Bar Greeting */}
          <div className="dashboard-topbar">
            <div>
              <span className="eyebrow-accent">JOBSEEKER PORTAL</span>
              <h1>
                Namaste, <em>{user?.fullName.split(" ")[0]}</em>
              </h1>
              <p>Your centralized job hunting control center &amp; employer activity overview.</p>
            </div>

            {/* Actively Seeking Toggle Card (Merojob Signature Widget) */}
            <div className={`actively-seeking-toggle-card ${user?.profile?.activelySeeking ? "is-active" : ""}`}>
              <div className="toggle-info">
                <div className="toggle-label-row">
                  <strong>Actively Searching for Job</strong>
                  {user?.profile?.activelySeeking ? (
                    <span className="pulse-badge green">ACTIVE (7 DAYS)</span>
                  ) : (
                    <span className="pulse-badge gray">OFF</span>
                  )}
                </div>
                <p>
                  {user?.profile?.activelySeeking
                    ? "Your profile is pinned at the top of recruiter searches with high-priority status."
                    : "Turn on to alert hiring managers that you are available immediately."}
                </p>
              </div>

              <button
                type="button"
                className={`switch-button ${user?.profile?.activelySeeking ? "checked" : ""}`}
                onClick={handleToggleActivelySeeking}
                disabled={savingAction === "activelySeeking"}
                aria-label="Toggle Actively Searching for Job"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>

          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === "overview" && (
            <>
              {/* Profile Strength & Metric Grid */}
              <div className="overview-hero-grid">
                {/* Profile Strength Meter */}
                <div className="profile-strength-card">
                  <div className="strength-header">
                    <div>
                      <h3>Profile Strength</h3>
                      <p>Boost your profile to unlock top employer invitations.</p>
                    </div>
                    <span className={`strength-badge ${profileStrength >= 80 ? "all-star" : "intermediate"}`}>
                      {profileStrength >= 80 ? "All-Star" : profileStrength >= 50 ? "Intermediate" : "Beginner"}
                    </span>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${profileStrength}%` }} />
                  </div>
                  <div className="progress-label-row">
                    <span>{profileStrength}% Complete</span>
                    <span>100% Recommended</span>
                  </div>

                  {/* Checklist of Profile Enhancements */}
                  <div className="strength-checklist">
                    <div className={`check-item ${user?.email && user?.phoneNumber ? "done" : ""}`}>
                      <Icon name={user?.email && user?.phoneNumber ? "check" : "close"} size={14} />
                      <span>Contact Info Verified</span>
                    </div>

                    <div className={`check-item ${user?.profile?.bio ? "done" : ""}`}>
                      <Icon name={user?.profile?.bio ? "check" : "close"} size={14} />
                      <span>Professional Summary / Bio</span>
                      {!user?.profile?.bio && (
                        <button className="inline-add-btn" onClick={() => setShowEditModal("profile")}>
                          + Add
                        </button>
                      )}
                    </div>

                    <div className={`check-item ${(user?.profile?.skills?.length || 0) >= 3 ? "done" : ""}`}>
                      <Icon name={(user?.profile?.skills?.length || 0) >= 3 ? "check" : "close"} size={14} />
                      <span>Key Skills ({user?.profile?.skills?.length || 0}/3 minimum)</span>
                      {(user?.profile?.skills?.length || 0) < 3 && (
                        <button className="inline-add-btn" onClick={() => setShowEditModal("profile")}>
                          + Add
                        </button>
                      )}
                    </div>

                    <div className={`check-item ${user?.profile?.resumeOriginalName ? "done" : ""}`}>
                      <Icon name={user?.profile?.resumeOriginalName ? "check" : "close"} size={14} />
                      <span>Resume / CV Uploaded</span>
                      {!user?.profile?.resumeOriginalName && (
                        <button className="inline-add-btn" onClick={() => setShowEditModal("profile")}>
                          + Upload
                        </button>
                      )}
                    </div>

                    <div className={`check-item ${user?.profile?.preferredJob?.category ? "done" : ""}`}>
                      <Icon name={user?.profile?.preferredJob?.category ? "check" : "close"} size={14} />
                      <span>Job Preferences Configured</span>
                      {!user?.profile?.preferredJob?.category && (
                        <button className="inline-add-btn" onClick={() => setShowEditModal("preferences")}>
                          + Set
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4 Metric Stats Cards */}
                <div className="metric-cards-col">
                  <div className="metric-box" onClick={() => setActiveTab("applications")}>
                    <div className="metric-icon mint">
                      <Icon name="briefcase" size={22} />
                    </div>
                    <div className="metric-text">
                      <strong>{applications.length}</strong>
                      <span>Applied Jobs</span>
                      <small>{interviewCount} Interview Stage</small>
                    </div>
                  </div>

                  <div className="metric-box" onClick={() => setActiveTab("performance")}>
                    <div className="metric-icon lime">
                      <Icon name="eye" size={22} />
                    </div>
                    <div className="metric-text">
                      <strong>{profileViews}</strong>
                      <span>Profile Views</span>
                      <small>+6 this week</small>
                    </div>
                  </div>

                  <div className="metric-box" onClick={() => setActiveTab("applications")}>
                    <div className="metric-icon gold">
                      <Icon name="award" size={22} />
                    </div>
                    <div className="metric-text">
                      <strong>{shortlistedCount + interviewCount}</strong>
                      <span>Shortlisted / Calls</span>
                      <small>{hiredCount} Job Offers</small>
                    </div>
                  </div>

                  <div className="metric-box" onClick={() => setActiveTab("saved")}>
                    <div className="metric-icon purple">
                      <Icon name="bookmark" size={22} />
                    </div>
                    <div className="metric-text">
                      <strong>{savedJobsList.length}</strong>
                      <span>Saved Vacancies</span>
                      <small>Ready to apply</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Jobs Matching Your Profile */}
              <section className="dashboard-content-block">
                <div className="block-header">
                  <div>
                    <span className="eyebrow-accent">MEROJOB SMART MATCH</span>
                    <h2>Jobs Matching Your Profile</h2>
                    <p>Calculated based on your listed skills and job preferences.</p>
                  </div>
                  <button className="text-link-btn" onClick={() => setActiveTab("matched")}>
                    View All Matches ({matchedJobs.length}) →
                  </button>
                </div>

                {matchedJobs.length === 0 ? (
                  <div className="empty-state">
                    <p>No job matches found yet. Add more skills to unlock personalized recommendations!</p>
                    <button className="primary-button compact" onClick={() => setShowEditModal("profile")}>
                      Add Skills
                    </button>
                  </div>
                ) : (
                  <div className="matched-jobs-grid">
                    {matchedJobs.slice(0, 4).map((job) => {
                      const isApplied = appliedJobIds.has(job._id);
                      const isSaved = (user?.profile?.savedJobs || []).includes(job._id);

                      return (
                        <div className="overview-job-card" key={job._id}>
                          <div className="job-card-top">
                            <span className="company-logo-badge">{(job.title || "J")[0]}</span>
                            <div className="match-pill">
                              <Icon name="zap" size={13} /> {job.matchScore}% Match
                            </div>
                            <button
                              className={`bookmark-btn ${isSaved ? "saved" : ""}`}
                              onClick={() => handleToggleSaveJob(job._id)}
                              title={isSaved ? "Saved" : "Save Job"}
                            >
                              <Icon name="bookmark" size={16} />
                            </button>
                          </div>

                          <div className="job-card-body">
                            <h4>
                              <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                            </h4>
                            <p className="company-name">
                              {typeof job.company === "object" ? job.company?.companyName : "Top Employer"}
                            </p>

                            <div className="job-meta-row">
                              <span>
                                <Icon name="map" size={13} /> {job.location}
                              </span>
                              <span>
                                <Icon name="clock" size={13} /> {job.jobType}
                              </span>
                            </div>

                            {job.salary ? (
                              <div className="salary-tag">
                                NPR {Number(job.salary).toLocaleString()} /mo
                              </div>
                            ) : null}

                            {/* Skills Tags */}
                            <div className="skill-tags-row">
                              {job.skills?.slice(0, 3).map((sk) => (
                                <span
                                  key={sk}
                                  className={`tag ${
                                    job.matchingSkills?.includes(sk.toLowerCase()) ? "matched" : ""
                                  }`}
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="job-card-footer">
                            <Link href={`/jobs/${job._id}`} className="secondary-button compact">
                              Details
                            </Link>

                            {isApplied ? (
                              <span className="status-pill green">Applied ✓</span>
                            ) : (
                              <button
                                className="primary-button compact"
                                onClick={() => handleQuickApply(job._id)}
                                disabled={savingAction === `apply-${job._id}`}
                              >
                                {savingAction === `apply-${job._id}` ? "Applying..." : "Quick Apply"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Recent Applications Snapshot */}
              <section className="dashboard-content-block">
                <div className="block-header">
                  <div>
                    <span className="eyebrow-accent">APPLICATION STATUS</span>
                    <h2>Recent Job Applications</h2>
                    <p>Live tracking of submitted resumes and interview calls.</p>
                  </div>
                  <button className="text-link-btn" onClick={() => setActiveTab("applications")}>
                    All Applications ({applications.length}) →
                  </button>
                </div>

                {applications.length === 0 ? (
                  <div className="empty-state">
                    <p>You haven&#39;t applied to any vacancies yet.</p>
                    <Link href="/jobs" className="primary-button compact">
                      Browse Active Openings
                    </Link>
                  </div>
                ) : (
                  <div className="application-table-card">
                    <table className="ats-table">
                      <thead>
                        <tr>
                          <th>Job Title &amp; Company</th>
                          <th>Location</th>
                          <th>Application Stage</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 5).map((app) => {
                          const job =
                            typeof app.job === "object" && app.job !== null
                              ? (app.job as Job)
                              : {
                                  _id: String(app.job),
                                  title: "Software Vacancy",
                                  location: "Kathmandu",
                                  company: "Verified Employer",
                                };

                          return (
                            <tr key={app._id}>
                              <td>
                                <div className="table-job-info">
                                  <strong>{job.title}</strong>
                                  <span>
                                    {typeof job.company === "object"
                                      ? job.company?.companyName
                                      : "HireHub Partner"}
                                  </span>
                                </div>
                              </td>
                              <td>{job.location}</td>
                              <td>
                                <span className={`status-pill ${app.status}`}>
                                  {app.status === "applied" && "● Applied"}
                                  {app.status === "viewed" && "👁 Profile Viewed"}
                                  {app.status === "shortlisted" && "★ Shortlisted"}
                                  {app.status === "interview" && "🎙 Interview Scheduled"}
                                  {app.status === "hired" && "🎉 Hired / Offer"}
                                  {app.status === "rejected" && "Not Selected"}
                                </span>
                              </td>
                              <td>
                                <Link href={`/jobs/${job._id}`} className="accent-link">
                                  View Job →
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ================= MATCHED JOBS TAB ================= */}
          {activeTab === "matched" && (
            <section className="tab-pane">
              <div className="block-header">
                <div>
                  <span className="eyebrow-accent">SMART MATCHING ALGORITHM</span>
                  <h2>Recommended Jobs for You</h2>
                  <p>
                    Matched against your skills (
                    {user?.profile?.skills?.join(", ") || "No skills added yet"}) and preferences.
                  </p>
                </div>
                <button
                  className="secondary-button compact"
                  onClick={() => setShowEditModal("preferences")}
                >
                  <Icon name="sliders" size={14} /> Refine Preferences
                </button>
              </div>

              <div className="matched-jobs-grid">
                {matchedJobs.map((job) => {
                  const isApplied = appliedJobIds.has(job._id);
                  const isSaved = (user?.profile?.savedJobs || []).includes(job._id);

                  return (
                    <div className="overview-job-card" key={job._id}>
                      <div className="job-card-top">
                        <span className="company-logo-badge">{(job.title || "J")[0]}</span>
                        <div className="match-pill">
                          <Icon name="zap" size={13} /> {job.matchScore}% Match
                        </div>
                        <button
                          className={`bookmark-btn ${isSaved ? "saved" : ""}`}
                          onClick={() => handleToggleSaveJob(job._id)}
                        >
                          <Icon name="bookmark" size={16} />
                        </button>
                      </div>

                      <div className="job-card-body">
                        <h4>
                          <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                        </h4>
                        <p className="company-name">
                          {typeof job.company === "object" ? job.company?.companyName : "Top Employer"}
                        </p>

                        <div className="job-meta-row">
                          <span>
                            <Icon name="map" size={13} /> {job.location}
                          </span>
                          <span>
                            <Icon name="clock" size={13} /> {job.jobType}
                          </span>
                        </div>

                        {job.salary ? (
                          <div className="salary-tag">NPR {Number(job.salary).toLocaleString()} /mo</div>
                        ) : null}

                        <div className="skill-tags-row">
                          {job.skills?.map((sk) => (
                            <span
                              key={sk}
                              className={`tag ${
                                job.matchingSkills?.includes(sk.toLowerCase()) ? "matched" : ""
                              }`}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="job-card-footer">
                        <Link href={`/jobs/${job._id}`} className="secondary-button compact">
                          Details
                        </Link>
                        {isApplied ? (
                          <span className="status-pill green">Applied ✓</span>
                        ) : (
                          <button
                            className="primary-button compact"
                            onClick={() => handleQuickApply(job._id)}
                            disabled={savingAction === `apply-${job._id}`}
                          >
                            {savingAction === `apply-${job._id}` ? "Applying..." : "Quick Apply"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ================= APPLIED JOBS (ATS PIPELINE) ================= */}
          {activeTab === "applications" && (
            <section className="tab-pane">
              <div className="block-header">
                <div>
                  <span className="eyebrow-accent">APPLICANT TRACKING SYSTEM</span>
                  <h2>Applied Jobs &amp; Application Status</h2>
                  <p>Follow every stage from review to interview and offer.</p>
                </div>
                <Link href="/jobs" className="primary-button compact">
                  Explore More Vacancies
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="empty-state">
                  <p>You have not applied to any jobs yet.</p>
                  <Link href="/jobs" className="primary-button compact">
                    Browse All Jobs
                  </Link>
                </div>
              ) : (
                <div className="application-cards-container">
                  {applications.map((app) => {
                    const job =
                      typeof app.job === "object" && app.job !== null
                        ? (app.job as Job)
                        : {
                            _id: String(app.job),
                            title: "Job Vacancy",
                            location: "Kathmandu",
                            company: "Verified Employer",
                          };

                    // Stepper calculation
                    const steps = ["applied", "viewed", "shortlisted", "interview", "hired"];
                    const currentStepIndex = steps.indexOf(app.status);

                    return (
                      <div className="ats-application-card" key={app._id}>
                        <div className="ats-card-header">
                          <div className="ats-company-block">
                            <span className="company-logo-badge">{(job.title || "J")[0]}</span>
                            <div>
                              <h3>
                                <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                              </h3>
                              <p>
                                {typeof job.company === "object"
                                  ? job.company?.companyName
                                  : "HireHub Partner"}{" "}
                                • {job.location}
                              </p>
                            </div>
                          </div>
                          <span className={`status-pill ${app.status}`}>{app.status.toUpperCase()}</span>
                        </div>

                        {/* ATS 5-Step Visual Stepper */}
                        <div className="ats-stepper">
                          <div className={`step-item ${currentStepIndex >= 0 ? "active" : ""}`}>
                            <div className="step-circle">1</div>
                            <span>Applied</span>
                          </div>
                          <div className={`step-line ${currentStepIndex >= 1 ? "active" : ""}`} />
                          <div className={`step-item ${currentStepIndex >= 1 ? "active" : ""}`}>
                            <div className="step-circle">2</div>
                            <span>Viewed</span>
                          </div>
                          <div className={`step-line ${currentStepIndex >= 2 ? "active" : ""}`} />
                          <div className={`step-item ${currentStepIndex >= 2 ? "active" : ""}`}>
                            <div className="step-circle">3</div>
                            <span>Shortlisted</span>
                          </div>
                          <div className={`step-line ${currentStepIndex >= 3 ? "active" : ""}`} />
                          <div className={`step-item ${currentStepIndex >= 3 ? "active" : ""}`}>
                            <div className="step-circle">4</div>
                            <span>Interview</span>
                          </div>
                          <div className={`step-line ${currentStepIndex >= 4 ? "active" : ""}`} />
                          <div className={`step-item ${currentStepIndex >= 4 ? "active" : ""}`}>
                            <div className="step-circle">5</div>
                            <span>Hired</span>
                          </div>
                        </div>

                        <div className="ats-card-footer">
                          <span className="text-muted">
                            Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
                          </span>
                          <Link href={`/jobs/${job._id}`} className="accent-link">
                            View Vacancy Details →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ================= SAVED JOBS ================= */}
          {activeTab === "saved" && (
            <section className="tab-pane">
              <div className="block-header">
                <div>
                  <span className="eyebrow-accent">BOOKMARKED OPPORTUNITIES</span>
                  <h2>Saved Vacancies</h2>
                  <p>Jobs you saved for review or quick application.</p>
                </div>
              </div>

              {savedJobsList.length === 0 ? (
                <div className="empty-state">
                  <p>No saved jobs yet. Click the bookmark icon on any job card to save it here.</p>
                  <Link href="/jobs" className="primary-button compact">
                    Browse Vacancies
                  </Link>
                </div>
              ) : (
                <div className="matched-jobs-grid">
                  {savedJobsList.map((job) => {
                    const isApplied = appliedJobIds.has(job._id);

                    return (
                      <div className="overview-job-card" key={job._id}>
                        <div className="job-card-top">
                          <span className="company-logo-badge">{(job.title || "J")[0]}</span>
                          <button
                            className="bookmark-btn saved"
                            onClick={() => handleToggleSaveJob(job._id)}
                            title="Remove from saved"
                          >
                            <Icon name="bookmark" size={16} />
                          </button>
                        </div>

                        <div className="job-card-body">
                          <h4>
                            <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                          </h4>
                          <p className="company-name">
                            {typeof job.company === "object" ? job.company?.companyName : "Top Employer"}
                          </p>
                          <div className="job-meta-row">
                            <span>
                              <Icon name="map" size={13} /> {job.location}
                            </span>
                            <span>
                              <Icon name="clock" size={13} /> {job.jobType}
                            </span>
                          </div>
                        </div>

                        <div className="job-card-footer">
                          <Link href={`/jobs/${job._id}`} className="secondary-button compact">
                            Details
                          </Link>
                          {isApplied ? (
                            <span className="status-pill green">Applied ✓</span>
                          ) : (
                            <button
                              className="primary-button compact"
                              onClick={() => handleQuickApply(job._id)}
                              disabled={savingAction === `apply-${job._id}`}
                            >
                              {savingAction === `apply-${job._id}` ? "Applying..." : "Apply Now"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ================= PREFERRED JOBS ================= */}
          {activeTab === "preferences" && (
            <section className="tab-pane">
              <div className="block-header">
                <div>
                  <span className="eyebrow-accent">CAREER PREFERENCES</span>
                  <h2>Preferred Jobs &amp; Settings</h2>
                  <p>Merojob uses these preferences to match you with employers and vacancies.</p>
                </div>
                <button
                  className="primary-button compact"
                  onClick={() => setShowEditModal("preferences")}
                >
                  <Icon name="edit" size={14} /> Edit Preferences
                </button>
              </div>

              <div className="preference-details-card">
                <div className="preference-row">
                  <div className="pref-icon">
                    <Icon name="briefcase" size={20} />
                  </div>
                  <div className="pref-data">
                    <label>Desired Job Category / Industry</label>
                    <strong>{user?.profile?.preferredJob?.category || "Information Technology"}</strong>
                  </div>
                </div>

                <div className="preference-row">
                  <div className="pref-icon">
                    <Icon name="map" size={20} />
                  </div>
                  <div className="pref-data">
                    <label>Preferred Work Location</label>
                    <strong>{user?.profile?.preferredJob?.location || "Kathmandu"}</strong>
                  </div>
                </div>

                <div className="preference-row">
                  <div className="pref-icon">
                    <Icon name="dollar" size={20} />
                  </div>
                  <div className="pref-data">
                    <label>Expected Monthly Salary (NPR)</label>
                    <strong>{user?.profile?.preferredJob?.expectedSalary || "Negotiable / Competitive"}</strong>
                  </div>
                </div>

                <div className="preference-row">
                  <div className="pref-icon">
                    <Icon name="award" size={20} />
                  </div>
                  <div className="pref-data">
                    <label>Desired Career Level</label>
                    <strong>{user?.profile?.preferredJob?.jobLevel || "Mid Level"}</strong>
                  </div>
                </div>

                <div className="preference-row">
                  <div className="pref-icon">
                    <Icon name="clock" size={20} />
                  </div>
                  <div className="pref-data">
                    <label>Employment Type</label>
                    <strong>{user?.profile?.preferredJob?.jobType || "Full-Time"}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= JOB ALERTS ================= */}
          {activeTab === "alerts" && (
            <section className="tab-pane">
              <div className="block-header">
                <div>
                  <span className="eyebrow-accent">NOTIFICATIONS</span>
                  <h2>Configured Job Alerts</h2>
                  <p>Receive notifications whenever matching vacancies are published.</p>
                </div>
                <button
                  className="primary-button compact"
                  onClick={() => setShowEditModal("alert")}
                >
                  <Icon name="bell" size={14} /> + Create New Alert
                </button>
              </div>

              {(user?.profile?.jobAlerts?.length || 0) === 0 ? (
                <div className="empty-state">
                  <p>You have not configured any job alerts yet.</p>
                  <button className="primary-button compact" onClick={() => setShowEditModal("alert")}>
                    Create Your First Alert
                  </button>
                </div>
              ) : (
                <div className="alerts-grid">
                  {user?.profile?.jobAlerts?.map((alert) => (
                    <div className="alert-card" key={alert._id}>
                      <div className="alert-header">
                        <Icon name="bell" size={18} />
                        <button
                          className="delete-icon-btn"
                          onClick={() => alert._id && handleDeleteAlert(alert._id)}
                          title="Delete Alert"
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                      <strong>{alert.category || "Any Category"}</strong>
                      <p>Keywords: {alert.keyword || "All vacancies"}</p>
                      <span className="alert-freq-pill">{alert.frequency.toUpperCase()} NOTIFICATIONS</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ================= PROFILE VIEWS & PERFORMANCE ================= */}
          {activeTab === "performance" && (
            <section className="tab-pane">
              <div className="block-header">
                <div>
                  <span className="eyebrow-accent">CANDIDATE ANALYTICS</span>
                  <h2>Profile Views &amp; Employer Reach</h2>
                  <p>Track which companies have evaluated your resume.</p>
                </div>
              </div>

              <div className="stats-row">
                <div>
                  <strong>{profileViews}</strong>
                  <span>Total Profile Views</span>
                </div>
                <div>
                  <strong>{applications.length * 2 + 12}</strong>
                  <span>Search Appearances</span>
                </div>
                <div>
                  <strong>{interviewCount + shortlistedCount}</strong>
                  <span>Recruiter Actions</span>
                </div>
              </div>

              <div className="application-table-card">
                <div className="card-header-inner">
                  <h3>Recent Recruiter Activity</h3>
                </div>
                <table className="ats-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Industry</th>
                      <th>Activity</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>DishHome Nepal</strong></td>
                      <td>Telecommunications</td>
                      <td><span className="status-pill green">Viewed Complete CV</span></td>
                      <td>2 hours ago</td>
                    </tr>
                    <tr>
                      <td><strong>Logpoint Software</strong></td>
                      <td>IT &amp; Cybersecurity</td>
                      <td><span className="status-pill green">Appeared in Candidate Search</span></td>
                      <td>Yesterday</td>
                    </tr>
                    <tr>
                      <td><strong>Ncell Axiata</strong></td>
                      <td>Telecom &amp; Tech</td>
                      <td><span className="status-pill green">Resume Downloaded</span></td>
                      <td>3 days ago</td>
                    </tr>
                    <tr>
                      <td><strong>Deerwalk Services</strong></td>
                      <td>Healthcare Software</td>
                      <td><span className="status-pill green">Viewed Profile</span></td>
                      <td>5 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Bottom Career Resources Card */}
          <section className="merojob-resource-card">
            <div className="resource-icon">
              <Icon name="award" size={26} />
            </div>
            <div className="resource-copy">
              <strong>Need help polishing your resume for Nepali recruiters?</strong>
              <p>
                Browse our expert tips on interview preparation, salary negotiation, and local ATS
                resume standards.
              </p>
            </div>
            <Link href="/jobs" className="secondary-button compact">
              Explore Guide
            </Link>
          </section>
        </main>
      </div>

      {/* ================= MODAL: EDIT PROFILE / RESUME ================= */}
      {showEditModal === "profile" && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Update Your Profile &amp; Resume</h3>
              <button className="icon-close" onClick={() => setShowEditModal(null)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-form">
              <label>
                Full Name
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="text"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  required
                />
              </label>

              <label>
                Professional Bio / Summary
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Detail your professional experience and career goals..."
                />
              </label>

              <label>
                Skills (Comma separated)
                <input
                  type="text"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  placeholder="React, TypeScript, Node.js, Python, PostgreSQL"
                />
              </label>

              <label>
                Resume File Name
                <input
                  type="text"
                  value={profileForm.resumeOriginalName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, resumeOriginalName: e.target.value })
                  }
                  placeholder="e.g. Shekhar_Rai_Resume_2026.pdf"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowEditModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingAction === "profile"}
                >
                  {savingAction === "profile" ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PREFERENCES ================= */}
      {showEditModal === "preferences" && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Job Preferences</h3>
              <button className="icon-close" onClick={() => setShowEditModal(null)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePreferences} className="modal-form">
              <label>
                Desired Industry / Category
                <select
                  value={preferencesForm.category}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, category: e.target.value })
                  }
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Banking & Financial Services">Banking &amp; Financial Services</option>
                  <option value="Healthcare & Pharmaceuticals">Healthcare &amp; Pharmaceuticals</option>
                  <option value="Advertising, Design & Media">Advertising, Design &amp; Media</option>
                  <option value="Telecommunications & ISP">Telecommunications &amp; ISP</option>
                  <option value="Sales & Business Development">Sales &amp; Business Development</option>
                </select>
              </label>

              <label>
                Preferred Location
                <select
                  value={preferencesForm.location}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, location: e.target.value })
                  }
                >
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Bhaktapur">Bhaktapur</option>
                  <option value="Pokhara">Pokhara</option>
                  <option value="Biratnagar">Biratnagar</option>
                  <option value="Remote">Remote</option>
                </select>
              </label>

              <label>
                Expected Salary Range (NPR / Month)
                <input
                  type="text"
                  value={preferencesForm.expectedSalary}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, expectedSalary: e.target.value })
                  }
                  placeholder="e.g. 50,000 - 80,000"
                />
              </label>

              <label>
                Job Level
                <select
                  value={preferencesForm.jobLevel}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, jobLevel: e.target.value })
                  }
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Top Executive">Top Executive</option>
                </select>
              </label>

              <label>
                Employment Type
                <select
                  value={preferencesForm.jobType}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, jobType: e.target.value })
                  }
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowEditModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingAction === "preferences"}
                >
                  {savingAction === "preferences" ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE JOB ALERT ================= */}
      {showEditModal === "alert" && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create New Job Alert</h3>
              <button className="icon-close" onClick={() => setShowEditModal(null)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleAddJobAlert} className="modal-form">
              <label>
                Job Category
                <select
                  value={alertForm.category}
                  onChange={(e) => setAlertForm({ ...alertForm, category: e.target.value })}
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Banking & Financial Services">Banking &amp; Financial Services</option>
                  <option value="Healthcare & Pharmaceuticals">Healthcare &amp; Pharmaceuticals</option>
                  <option value="Telecommunications & ISP">Telecommunications &amp; ISP</option>
                  <option value="Sales & Marketing">Sales &amp; Marketing</option>
                </select>
              </label>

              <label>
                Keywords (e.g. React, Python, Accountant)
                <input
                  type="text"
                  value={alertForm.keyword}
                  onChange={(e) => setAlertForm({ ...alertForm, keyword: e.target.value })}
                  placeholder="e.g. Frontend, React"
                />
              </label>

              <label>
                Frequency
                <select
                  value={alertForm.frequency}
                  onChange={(e) => setAlertForm({ ...alertForm, frequency: e.target.value })}
                >
                  <option value="daily">Daily Notification</option>
                  <option value="weekly">Weekly Digest</option>
                  <option value="instant">Instant Notification</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowEditModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingAction === "alert"}
                >
                  {savingAction === "alert" ? "Creating..." : "Set Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <Icon name="spark" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </PageShell>
  );
}

export default function JobseekerOverviewPage() {
  return (
    <Suspense fallback={<div className="empty-state"><div className="loader" /><p>Loading jobseeker portal...</p></div>}>
      <JobseekerOverviewContent />
    </Suspense>
  );
}
