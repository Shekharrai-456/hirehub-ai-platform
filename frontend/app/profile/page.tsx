"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { API_BASE, updateUserProfile, uploadResume } from "@/src/lib/api";
import { useIsMounted } from "@/src/lib/useMounted";
import type { User } from "@/src/types";

const SUGGESTED_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Next.js",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "REST APIs",
  "GraphQL",
  "Docker",
  "AWS",
  "Figma",
  "Git",
  "Tailwind CSS",
];

function readSavedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem("hirehub-user");
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const mounted = useIsMounted();
  const [user, setUser] = useState<User | null>(() => (mounted ? readSavedUser() : null));

  // Initialize state once mounted
  const [initialized, setInitialized] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Resume upload state
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMessage, setResumeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync state after mount
  if (mounted && !initialized) {
    const savedUser = readSavedUser();
    if (savedUser) {
      setUser(savedUser);
      setFullName(savedUser.fullName || "");
      setEmail(savedUser.email || "");
      setPhoneNumber(String(savedUser.phoneNumber || ""));
      setBio(savedUser.profile?.bio || "");
      setSkillsList(savedUser.profile?.skills || []);
    }
    setInitialized(true);
  }

  function addSkill(skillName: string) {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    setSkillsList([...skillsList, trimmed]);
    setCustomSkillInput("");
  }

  function removeSkill(skillToRemove: string) {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  }

  async function handleProfileSave(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const result = await updateUserProfile({
        fullName,
        email,
        phoneNumber,
        bio,
        skills: skillsList.join(", "),
      });

      setUser(result.user);
      window.localStorage.setItem("hirehub-user", JSON.stringify(result.user));
      setProfileMessage({ type: "success", text: "Profile information saved successfully!" });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  function handleFileSelection(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = [".pdf", ".doc", ".docx"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(ext)) {
        setResumeMessage({
          type: "error",
          text: "Invalid file format. Please upload a PDF or DOC/DOCX document.",
        });
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setResumeMessage({
          type: "error",
          text: "File size exceeds 15MB limit.",
        });
        return;
      }
      setSelectedFile(file);
      setResumeMessage(null);
    }
  }

  async function handleResumeUpload() {
    if (!selectedFile) return;
    setUploadingResume(true);
    setResumeMessage(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const result = await uploadResume(formData);
      setUser(result.user);
      window.localStorage.setItem("hirehub-user", JSON.stringify(result.user));
      setSelectedFile(null);
      setResumeMessage({
        type: "success",
        text: "Resume uploaded successfully and linked to your recruiter profile!",
      });
    } catch (error) {
      setResumeMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not upload resume.",
      });
    } finally {
      setUploadingResume(false);
    }
  }

  if (mounted && !user) {
    return (
      <PageShell>
        <div className="empty-state">
          <h2>Candidate Sign In Required</h2>
          <p>Please log in to manage your professional profile, resume, and skill portfolio.</p>
          <div className="empty-state-actions">
            <Link className="primary-button" href="/login">
              Sign In to HireHub
            </Link>
            <Link className="secondary-button" href="/register">
              Create Free Account
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const existingResume = user?.profile?.resume;
  const existingResumeName = user?.profile?.resumeOriginalName || "Candidate_Resume.pdf";
  const resumeDownloadUrl = existingResume ? `${API_BASE}${existingResume}` : null;

  return (
    <PageShell>
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow-accent">CANDIDATE PORTFOLIO</span>
          <h1>
            Your Professional Profile &amp; <br />
            <em>Career Resume.</em>
          </h1>
          <p>
            Complete your profile and upload your resume to enable AI job compatibility scoring and boost your visibility to verified employers.
          </p>
        </div>
        <Link className="secondary-button" href="/dashboard">
          ← View My Dashboard
        </Link>
      </section>

      <div className="profile-page-grid">
        {/* Left Column: Profile Form & Skills */}
        <div className="profile-main-col">
          <form className="profile-form-card" onSubmit={handleProfileSave}>
            <div className="card-section-title">
              <Icon name="user" size={18} />
              <h2>Personal &amp; Contact Details</h2>
            </div>

            <div className="form-grid-2">
              <label className="form-field">
                <span>Full Name *</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Shrestha"
                />
              </label>

              <label className="form-field">
                <span>Email Address *</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                />
              </label>
            </div>

            <label className="form-field">
              <span>Phone Number *</span>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+977 9800000000"
              />
            </label>

            <label className="form-field">
              <span>Professional Bio &amp; Career Objective</span>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your expertise, experience, and the kind of roles you are seeking..."
              />
            </label>

            {/* Technical Skills Manager */}
            <div className="skills-manager-block">
              <div className="skills-block-header">
                <div>
                  <span className="field-title">Key Technical &amp; Professional Skills</span>
                  <span className="field-hint">Add your primary proficiencies to unlock AI Skills Compatibility scoring.</span>
                </div>
                <span className="skills-counter">{skillsList.length} Selected</span>
              </div>

              {/* Active Skill Tags */}
              <div className="active-skills-chips">
                {skillsList.map((skill) => (
                  <span key={skill} className="skill-chip">
                    {skill}
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() => removeSkill(skill)}
                      className="skill-remove-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {skillsList.length === 0 && (
                  <span className="no-skills-notice">No skills added yet. Select from below or type your own.</span>
                )}
              </div>

              {/* Add Custom Skill input */}
              <div className="add-skill-row">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(customSkillInput);
                    }
                  }}
                  placeholder="Type a skill (e.g. Next.js, Redux, Docker) and press Enter..."
                />
                <button
                  type="button"
                  className="secondary-button compact"
                  onClick={() => addSkill(customSkillInput)}
                >
                  Add +
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="skills-suggestions">
                <span className="suggestions-label">Suggestions:</span>
                <div className="suggestions-list">
                  {SUGGESTED_SKILLS.filter(
                    (s) => !skillsList.some((existing) => existing.toLowerCase() === s.toLowerCase())
                  ).slice(0, 8).map((suggested) => (
                    <button
                      key={suggested}
                      type="button"
                      className="suggestion-tag-btn"
                      onClick={() => addSkill(suggested)}
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {profileMessage && (
              <div className={`form-alert ${profileMessage.type}`}>
                <Icon name={profileMessage.type === "success" ? "check" : "close"} size={16} />
                <span>{profileMessage.text}</span>
              </div>
            )}

            <button type="submit" className="primary-button" disabled={savingProfile}>
              {savingProfile ? "Saving Profile..." : "Save Profile Information"}
            </button>
          </form>
        </div>

        {/* Right Column: Resume (CV) Upload Card */}
        <aside className="profile-resume-col">
          <div className="resume-upload-card">
            <div className="card-section-title">
              <Icon name="spark" size={18} />
              <h2>Curriculum Vitae (CV)</h2>
            </div>
            <p className="resume-card-desc">
              Upload your verified CV or Resume. Employers will review this file when assessing your job applications.
            </p>

            {/* Current Active Resume display */}
            {existingResume && (
              <div className="current-resume-box">
                <div className="resume-badge-row">
                  <span className="badge-active-cv">
                    <Icon name="badgeCheck" size={13} /> Active Resume
                  </span>
                </div>
                <div className="resume-meta-info">
                  <div className="doc-icon-wrap">
                    <span className="doc-icon">📄</span>
                  </div>
                  <div className="doc-name-col">
                    <strong className="resume-file-name" title={existingResumeName}>
                      {existingResumeName}
                    </strong>
                    <span className="resume-file-format">PDF / DOC Document</span>
                  </div>
                </div>

                <div className="resume-actions-row">
                  {resumeDownloadUrl && (
                    <a
                      href={resumeDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-button compact"
                    >
                      View / Download CV ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* File upload drag/picker zone */}
            <div className="resume-drop-zone">
              <input
                type="file"
                id="resume-file-input"
                className="resume-file-hidden-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelection}
              />
              <label htmlFor="resume-file-input" className="resume-drop-label">
                <span className="upload-cloud-icon">☁️</span>
                <strong>{selectedFile ? selectedFile.name : existingResume ? "Choose New Resume Version" : "Upload Your CV / Resume"}</strong>
                <span className="upload-help-text">PDF, DOC, DOCX up to 15MB</span>
              </label>

              {selectedFile && (
                <div className="selected-file-confirm-bar">
                  <span>Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button
                    type="button"
                    className="primary-button full-width mt-3"
                    onClick={handleResumeUpload}
                    disabled={uploadingResume}
                  >
                    {uploadingResume ? "Uploading to Server..." : "Confirm & Save Resume ↑"}
                  </button>
                </div>
              )}
            </div>

            {resumeMessage && (
              <div className={`form-alert ${resumeMessage.type}`}>
                <Icon name={resumeMessage.type === "success" ? "check" : "close"} size={16} />
                <span>{resumeMessage.text}</span>
              </div>
            )}

            <div className="resume-trust-note">
              <Icon name="badgeCheck" size={14} />
              <span>Your resume is encrypted and only shared with verified employers you apply to.</span>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
