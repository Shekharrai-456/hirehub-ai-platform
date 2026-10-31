"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import {
  API_BASE,
  createJob,
  getApplicants,
  getCompany,
  getCompanyJobs,
  updateApplicationStatus,
  updateCompanyProfile,
  uploadCompanyLogo,
} from "@/src/lib/api";
import { useIsMounted } from "@/src/lib/useMounted";
import type { Application, Company, Job, User } from "@/src/types";

const emptyForm = {
  title: "",
  description: "",
  requirements: "",
  location: "Kathmandu",
  jobType: "full-time",
  experience: "2-4 years",
  position: "Mid Level",
  salary: "85000",
  skills: "React, Node.js, TypeScript",
  category: "Information Technology",
  deadline: "30 days remaining",
};

function readRecruiterSession(): { company: Company | null; user: User | null } {
  if (typeof window === "undefined") return { company: null, user: null };
  try {
    const savedComp = window.localStorage.getItem("hirehub-company");
    const savedUser = window.localStorage.getItem("hirehub-user");
    const u = savedUser ? (JSON.parse(savedUser) as User) : null;
    let c = savedComp ? (JSON.parse(savedComp) as Company) : null;
    if (!c && u?.role === "recruiter") {
      c = {
        _id: u._id,
        companyName: u.fullName || "Recruiter Organization",
        email: u.email,
        phoneNumber: String(u.phoneNumber || ""),
      };
    }
    return { company: c, user: u };
  } catch {
    return { company: null, user: null };
  }
}

export default function RecruiterPage() {
  const mounted = useIsMounted();
  const session = mounted ? readRecruiterSession() : { company: null, user: null };
  const companySession = session.company;
  const user = session.user;

  const [currentCompany, setCurrentCompany] = useState<Company | null>(companySession);
  const [activeTab, setActiveTab] = useState<"jobs" | "company">("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [applicants, setApplicants] = useState<Record<string, Application[]>>({});
  const [statusMessage, setStatusMessage] = useState("");

  // Company Profile state
  const [compForm, setCompForm] = useState({
    companyName: companySession?.companyName || "",
    email: companySession?.email || "",
    phoneNumber: companySession?.phoneNumber || "",
    location: companySession?.location || "Kathmandu, Nepal",
    website: companySession?.website || "",
    industry: companySession?.industry || "Technology & Software",
    size: companySession?.size || "50-100 Employees",
    description: companySession?.description || "",
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyMessage, setCompanyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoNotice, setLogoNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch fresh company details from backend
  useEffect(() => {
    const compId = companySession?._id;
    if (!compId) return;
    let active = true;

    getCompany(compId)
      .then((fresh) => {
        if (!active || !fresh) return;
        setCurrentCompany(fresh);
        setCompForm({
          companyName: fresh.companyName || "",
          email: fresh.email || "",
          phoneNumber: fresh.phoneNumber || "",
          location: fresh.location || "Kathmandu, Nepal",
          website: fresh.website || "",
          industry: fresh.industry || "Technology & Software",
          size: fresh.size || "50-100 Employees",
          description: fresh.description || "",
        });
        window.localStorage.setItem("hirehub-company", JSON.stringify(fresh));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [companySession?._id]);


  useEffect(() => {
    if (!currentCompany?._id) return;
    let active = true;
    getCompanyJobs(currentCompany._id)
      .then((data) => {
        if (!active) return;
        setJobs(data);
        data.forEach((j) => {
          getApplicants(j._id).then((apps) => {
            if (active) {
              setApplicants((prev) => ({ ...prev, [j._id]: apps }));
            }
          });
        });
      })
      .catch((error) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Could not load vacancies.");
        }
      });
    return () => {
      active = false;
    };
  }, [currentCompany?._id]);

  async function submitJob(event: FormEvent) {
    event.preventDefault();
    if (!currentCompany) return;
    try {
      const result = await createJob({
        ...form,
        company: currentCompany._id,
      });
      setJobs((current) => [result.job, ...current]);
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Vacancy successfully posted! It is now live in search and categories.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not post job vacancy.");
    }
  }

  async function handleStatusChange(applicationId: string, jobId: string, newStatus: Application["status"]) {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setStatusMessage(`Status updated to ${newStatus}`);
      setApplicants((prev) => {
        const currentList = prev[jobId] || [];
        return {
          ...prev,
          [jobId]: currentList.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          ),
        };
      });
    } catch {
      setStatusMessage("Failed to update status.");
    }
  }

  async function handleCompanyUpdate(e: FormEvent) {
    e.preventDefault();
    if (!currentCompany?._id) return;
    setSavingCompany(true);
    setCompanyMessage(null);

    try {
      const res = await updateCompanyProfile({
        ...compForm,
        companyId: currentCompany._id,
      });
      setCurrentCompany(res.company);
      window.localStorage.setItem("hirehub-company", JSON.stringify(res.company));
      setCompanyMessage({ type: "success", text: "Organization profile updated successfully!" });
    } catch (err) {
      setCompanyMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update company profile.",
      });
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleLogoFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !currentCompany?._id) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("logo", file);

    setUploadingLogo(true);
    setLogoNotice(null);

    try {
      const res = await uploadCompanyLogo(formData, currentCompany._id);
      setCurrentCompany(res.company);
      window.localStorage.setItem("hirehub-company", JSON.stringify(res.company));
      setLogoNotice({ type: "success", text: "Organization logo updated successfully!" });
    } catch (err) {
      setLogoNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload logo image.",
      });
    } finally {
      setUploadingLogo(false);
    }
  }

  if (mounted && !currentCompany && user?.role !== "recruiter") {
    return (
      <PageShell>
        <div className="empty-state">
          <h2>Employer Workspace</h2>
          <p>Please sign in with your Employer or Recruiter account to manage vacancies and candidates.</p>
          <div className="empty-state-actions">
            <Link className="primary-button" href="/login">
              Recruiter Sign In
            </Link>
            <Link className="secondary-button" href="/employer-zone">
              About Employer Zone
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const totalApplicantsCount = Object.values(applicants).reduce((sum, list) => sum + list.length, 0);
  const interviewCount = Object.values(applicants).reduce(
    (sum, list) => sum + list.filter((a) => a.status === "interview").length,
    0
  );
  const hiredCount = Object.values(applicants).reduce(
    (sum, list) => sum + list.filter((a) => a.status === "hired").length,
    0
  );

  const logoDisplayUrl = currentCompany?.logo
    ? currentCompany.logo.startsWith("http")
      ? currentCompany.logo
      : `${API_BASE}${currentCompany.logo}`
    : null;

  return (
    <PageShell>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow-accent">EMPLOYER DASHBOARD</span>
          <h1>
            {currentCompany?.companyName || "Employer Workspace"} <br />
            <em>Recruitment Hub.</em>
          </h1>
          <p>Post verified job openings, inspect uploaded candidate resumes, and customize your public company showcase.</p>
        </div>
        <div className="dashboard-heading-buttons">
          {currentCompany?._id && (
            <Link className="secondary-button" href={`/companies/${currentCompany._id}`}>
              View Public Showcase ↗
            </Link>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setActiveTab("jobs");
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Close Form" : "Post a New Vacancy +"}
          </button>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="stats-row">
        <div>
          <strong>{jobs.length}</strong>
          <span>Active Vacancies</span>
        </div>
        <div>
          <strong>{totalApplicantsCount}</strong>
          <span>Total Applicants</span>
        </div>
        <div>
          <strong>{interviewCount}</strong>
          <span>Interviews Scheduled</span>
        </div>
        <div>
          <strong>{hiredCount}</strong>
          <span>Offers Extended</span>
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}
      {statusMessage && <p className="form-message">{statusMessage}</p>}

      {/* Tab Switcher */}
      <div className="dashboard-tab-bar">
        <button
          type="button"
          className={`dashboard-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          <Icon name="briefcase" size={16} />
          <span>Vacancies &amp; Candidates ({jobs.length})</span>
        </button>
        <button
          type="button"
          className={`dashboard-tab-btn ${activeTab === "company" ? "active" : ""}`}
          onClick={() => setActiveTab("company")}
        >
          <Icon name="building" size={16} />
          <span>Organization Profile &amp; Branding</span>
        </button>
      </div>

      {/* TAB 1: Vacancies & Pipeline */}
      {activeTab === "jobs" && (
        <>
          {/* Post a Vacancy Form */}
          {showForm && (
            <form className="profile-form recruiter-form" onSubmit={submitJob}>
              <h3>Post a Verified Job Vacancy</h3>

              <div className="form-grid-2">
                <label>
                  Job Title
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                  />
                </label>

                <label>
                  Job Category
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option>Information Technology</option>
                    <option>Banking &amp; Financial Services</option>
                    <option>Healthcare &amp; Pharmaceuticals</option>
                    <option>Advertising, Design &amp; Media</option>
                    <option>Education &amp; Non-Profit</option>
                    <option>Sales &amp; Business Development</option>
                    <option>Telecommunications &amp; ISP</option>
                  </select>
                </label>
              </div>

              <div className="form-grid-3">
                <label>
                  Employment Type
                  <select
                    value={form.jobType}
                    onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </label>

                <label>
                  Career Level
                  <input
                    required
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="e.g. Mid-Senior Level"
                  />
                </label>

                <label>
                  Experience
                  <input
                    required
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 3+ years"
                  />
                </label>
              </div>

              <label>
                Job Description
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Outline responsibilities and role summary..."
                />
              </label>

              <label>
                Requirements &amp; Qualifications (comma separated)
                <textarea
                  required
                  rows={3}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Bachelor in CS or related field, 3+ years in Node.js, Strong SQL skills"
                />
              </label>

              <div className="form-grid-3">
                <label>
                  Location / City
                  <input
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Kathmandu, Nepal"
                  />
                </label>

                <label>
                  Monthly Salary ($ or NPR)
                  <input
                    required
                    type="number"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="85000"
                  />
                </label>

                <label>
                  Application Deadline
                  <input
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    placeholder="e.g. 15 days remaining"
                  />
                </label>
              </div>

              <label>
                Required Skills (comma separated for AI Compatibility)
                <input
                  required
                  placeholder="React, TypeScript, GraphQL, Docker"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </label>

              <button className="primary-button" type="submit">
                Publish Vacancy Now →
              </button>
            </form>
          )}

          {/* Active Jobs & Applicants Management */}
          <section className="dashboard-section">
            <div className="results-heading">
              <h2>Your Published Vacancies</h2>
              <span className="muted-text">{jobs.length} Active Postings</span>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-state">
                <p>You have not published any job vacancies yet.</p>
                <button
                  type="button"
                  className="primary-button compact"
                  onClick={() => setShowForm(true)}
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="application-list">
                {jobs.map((job) => {
                  const jobApps = applicants[job._id] || [];
                  return (
                    <div key={job._id} className="recruiter-job-card-block">
                      <div className="application-row">
                        <div className="company-mark">{(job.title || "J")[0]}</div>
                        <div>
                          <strong>{job.title}</strong>
                          <p>
                            {job.location} · {job.jobType} · {job.category || "General"}
                          </p>
                        </div>
                        <span className="status green">
                          {jobApps.length} Applicants
                        </span>
                        <Link href={`/jobs/${job._id}`} className="accent-link">
                          Preview Vacancy
                        </Link>
                      </div>

                      {/* Applicants List */}
                      {jobApps.length > 0 && (
                        <div className="applicants-subtable">
                          <span className="subtable-title">Received Applications ({jobApps.length}):</span>
                          {jobApps.map((app) => {
                            const applicantObj: User =
                              typeof app.applicant === "object" && app.applicant !== null
                                ? (app.applicant as User)
                                : ({ _id: String(app.applicant), fullName: "Applicant", email: "N/A", role: "user" } as User);

                            const candidateResume = applicantObj.profile?.resume;
                            const resumeOriginalName = applicantObj.profile?.resumeOriginalName || "Candidate_CV.pdf";
                            const resumeUrl = candidateResume ? `${API_BASE}${candidateResume}` : null;

                            return (
                              <div key={app._id} className="applicant-pipeline-row">
                                <div className="app-person-info">
                                  <strong>{applicantObj.fullName}</strong>
                                  <span>{applicantObj.email}</span>
                                  {applicantObj.phoneNumber && (
                                    <span className="phone-tag">{applicantObj.phoneNumber}</span>
                                  )}
                                  {applicantObj.profile?.skills && applicantObj.profile.skills.length > 0 && (
                                    <div className="applicant-skills-strip">
                                      {applicantObj.profile.skills.slice(0, 3).map((s: string) => (
                                        <span key={s} className="app-skill-chip">{s}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* View / Download Resume Button */}
                                <div className="app-resume-action">
                                  {resumeUrl ? (
                                    <a
                                      href={resumeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="view-cv-btn"
                                      title="Download applicant CV"
                                    >
                                      📄 View CV ({resumeOriginalName.substring(resumeOriginalName.lastIndexOf(".") + 1).toUpperCase()}) ↗
                                    </a>
                                  ) : (
                                    <span className="no-cv-badge">No CV Uploaded</span>
                                  )}
                                </div>

                                <div className="status-changer-box">
                                  <label>Status:</label>
                                  <select
                                    value={app.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        app._id,
                                        job._id,
                                        e.target.value as Application["status"]
                                      )
                                    }
                                    className={`status-dropdown ${app.status}`}
                                  >
                                    <option value="applied">Applied</option>
                                    <option value="interview">Interview</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* TAB 2: Organization Profile & Branding */}
      {activeTab === "company" && (
        <section className="dashboard-section">
          <div className="company-editor-layout">
            {/* Left: Organization Details Form */}
            <form className="profile-form-card" onSubmit={handleCompanyUpdate}>
              <div className="card-section-title">
                <Icon name="building" size={18} />
                <h2>Organization Information</h2>
              </div>
              <p className="field-hint mb-4">
                This information powers your public company showcase and adds credibility to all vacancies posted under your brand.
              </p>

              <div className="form-grid-2">
                <label className="form-field">
                  <span>Organization Name *</span>
                  <input
                    type="text"
                    required
                    value={compForm.companyName}
                    onChange={(e) => setCompForm({ ...compForm, companyName: e.target.value })}
                    placeholder="e.g. Leapfrog Technology"
                  />
                </label>

                <label className="form-field">
                  <span>Contact Email *</span>
                  <input
                    type="email"
                    required
                    value={compForm.email}
                    onChange={(e) => setCompForm({ ...compForm, email: e.target.value })}
                    placeholder="careers@company.com"
                  />
                </label>
              </div>

              <div className="form-grid-2">
                <label className="form-field">
                  <span>Phone Number *</span>
                  <input
                    type="text"
                    required
                    value={compForm.phoneNumber}
                    onChange={(e) => setCompForm({ ...compForm, phoneNumber: e.target.value })}
                    placeholder="+977 1 4500000"
                  />
                </label>

                <label className="form-field">
                  <span>Office Location *</span>
                  <input
                    type="text"
                    required
                    value={compForm.location}
                    onChange={(e) => setCompForm({ ...compForm, location: e.target.value })}
                    placeholder="Kathmandu, Nepal"
                  />
                </label>
              </div>

              <div className="form-grid-3">
                <label className="form-field">
                  <span>Website URL</span>
                  <input
                    type="text"
                    value={compForm.website}
                    onChange={(e) => setCompForm({ ...compForm, website: e.target.value })}
                    placeholder="https://company.com"
                  />
                </label>

                <label className="form-field">
                  <span>Industry Sector</span>
                  <input
                    type="text"
                    value={compForm.industry}
                    onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })}
                    placeholder="Software & Cloud"
                  />
                </label>

                <label className="form-field">
                  <span>Company Size</span>
                  <select
                    value={compForm.size}
                    onChange={(e) => setCompForm({ ...compForm, size: e.target.value })}
                  >
                    <option>1-10 Employees</option>
                    <option>10-50 Employees</option>
                    <option>50-100 Employees</option>
                    <option>100-500 Employees</option>
                    <option>500+ Enterprise</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span>About the Organization &amp; Workplace Culture</span>
                <textarea
                  rows={5}
                  value={compForm.description}
                  onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                  placeholder="Share your company's mission, values, engineering culture, and benefits offered to employees..."
                />
              </label>

              {companyMessage && (
                <div className={`form-alert ${companyMessage.type}`}>
                  <Icon name={companyMessage.type === "success" ? "check" : "close"} size={16} />
                  <span>{companyMessage.text}</span>
                </div>
              )}

              <button type="submit" className="primary-button" disabled={savingCompany}>
                {savingCompany ? "Saving Changes..." : "Save Organization Profile"}
              </button>
            </form>

            {/* Right: Brand Logo Card */}
            <aside className="company-logo-sidebar">
              <div className="logo-upload-card">
                <div className="card-section-title">
                  <Icon name="award" size={18} />
                  <h2>Brand Logo</h2>
                </div>
                <p className="field-hint">
                  Your logo appears on all vacancy cards, search results, and your public showcase page.
                </p>

                <div className="logo-preview-box">
                  {logoDisplayUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoDisplayUrl}
                      alt={currentCompany?.companyName || "Logo"}
                      className="company-uploaded-logo-img"
                    />
                  ) : (
                    <div className="company-mark huge">
                      {(currentCompany?.companyName || "C")[0]}
                    </div>
                  )}
                </div>

                <div className="logo-upload-controls">
                  <input
                    type="file"
                    id="company-logo-input"
                    className="resume-file-hidden-input"
                    accept=".jpg,.jpeg,.png,.webp,.svg"
                    onChange={handleLogoFileChange}
                    disabled={uploadingLogo}
                  />
                  <label htmlFor="company-logo-input" className="secondary-button compact full-width">
                    {uploadingLogo ? "Uploading Logo..." : "Upload New Logo ↑"}
                  </label>
                  <span className="logo-spec-note">JPG, PNG, WEBP, or SVG (Square recommended)</span>
                </div>

                {logoNotice && (
                  <div className={`form-alert ${logoNotice.type} mt-3`}>
                    <Icon name={logoNotice.type === "success" ? "check" : "close"} size={16} />
                    <span>{logoNotice.text}</span>
                  </div>
                )}

                {currentCompany?._id && (
                  <div className="showcase-cta-block">
                    <span>Preview Public Showcase:</span>
                    <Link
                      href={`/companies/${currentCompany._id}`}
                      className="primary-button compact full-width"
                    >
                      Visit Public Company Page ↗
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}
    </PageShell>
  );
}
