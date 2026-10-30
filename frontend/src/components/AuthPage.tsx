"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { loginCompany, loginUser, registerCompany, registerUser } from "@/src/lib/api";
import type { Role } from "@/src/types";

export function AuthPage({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const isRecruiter = role === "recruiter";

  function handleDemoFill(demoRole: "user" | "recruiter") {
    setError("");
    setSuccess("");
    if (demoRole === "user") {
      setRole("user");
      setForm({
        fullName: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        phoneNumber: "9841234567",
        password: "password123",
      });
    } else {
      setRole("recruiter");
      setForm({
        fullName: "WorldLink Communications",
        email: "careers@worldlink.com.np",
        phoneNumber: "9801234567",
        password: "hirehub123",
      });
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (register) {
        if (isRecruiter) {
          await registerCompany({
            companyName: form.fullName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password,
          });
          setSuccess("Company account created! Redirecting to sign in...");
          setTimeout(() => {
            router.push("/login");
          }, 1200);
        } else {
          await registerUser({
            fullName: form.fullName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password,
            role: "user",
          });
          setSuccess("Account created successfully! Redirecting to sign in...");
          setTimeout(() => {
            router.push("/login");
          }, 1200);
        }
      } else {
        // LOGIN
        if (isRecruiter) {
          const result = await loginCompany(form.email, form.password);
          window.localStorage.setItem("hirehub-company", JSON.stringify(result.company));
          setSuccess(`Welcome back, ${result.company.companyName}! Redirecting to workspace...`);
          setTimeout(() => {
            router.push("/recruiter");
            router.refresh();
          }, 800);
        } else {
          const result = await loginUser(form.email, form.password, "user");
          window.localStorage.setItem("hirehub-user", JSON.stringify(result.user));
          setSuccess(`Welcome back, ${result.user.fullName.split(" ")[0]}! Redirecting...`);
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 800);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-root-wrapper">
      {/* Top Utility Bar */}
      <header className="auth-top-bar">
        <div className="auth-top-inner">
          <Link className="brand" href="/">
            <span className="logo-mark">H</span>
            <span>hire<span className="brand-accent">hub</span></span>
          </Link>
          <div className="auth-top-actions">
            <Link href="/" className="auth-home-link">
              <Icon name="arrow" size={15} />
              <span>Back to Vacancies</span>
            </Link>
            <span className="nav-divider" />
            <Link
              href={register ? "/login" : "/register"}
              className="secondary-button compact"
            >
              {register ? "Sign In Instead" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="auth-container">
        <div className="auth-split-card">
          {/* Left Hero Showcase */}
          <section className="auth-showcase-panel">
            <div className="auth-showcase-content">
              <span className="auth-hero-pill">
                <span className="pulse-dot" />
                NEPAL&apos;S #1 CAREER PLATFORM
              </span>

              <h2 className="auth-showcase-title">
                {isRecruiter
                  ? "Hire Nepal's Premier Talent Faster & Smarter."
                  : "Start Your Career Journey with Verified Employers."}
              </h2>

              <p className="auth-showcase-desc">
                {isRecruiter
                  ? "Join over 57+ top organizations and innovative startups streamlining hiring pipelines on HireHub."
                  : "Explore thousands of verified vacancies, compare salaries, and track application stages in real-time."}
              </p>

              {/* Value Checkpoints */}
              <div className="auth-features-list">
                {isRecruiter ? (
                  <>
                    <div className="auth-feature-item">
                      <div className="feature-icon-badge">
                        <Icon name="check" size={14} />
                      </div>
                      <div>
                        <strong>Instant Vacancy Distribution</strong>
                        <p>Published openings are instantly indexed in search and category feeds.</p>
                      </div>
                    </div>

                    <div className="auth-feature-item">
                      <div className="feature-icon-badge">
                        <Icon name="check" size={14} />
                      </div>
                      <div>
                        <strong>Smart Candidate Pipeline</strong>
                        <p>Progress applicants seamlessly: Applied → Interview → Hired.</p>
                      </div>
                    </div>

                    <div className="auth-feature-item">
                      <div className="feature-icon-badge">
                        <Icon name="check" size={14} />
                      </div>
                      <div>
                        <strong>Verified Employer Badge</strong>
                        <p>Build candidate trust with official organizational verification.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="auth-feature-item">
                      <div className="feature-icon-badge">
                        <Icon name="check" size={14} />
                      </div>
                      <div>
                        <strong>One-Click Quick Apply</strong>
                        <p>Apply directly to top tier IT, Telecom, and Banking vacancies.</p>
                      </div>
                    </div>

                    <div className="auth-feature-item">
                      <div className="feature-icon-badge">
                        <Icon name="check" size={14} />
                      </div>
                      <div>
                        <strong>AI Skills Compatibility Match</strong>
                        <p>See real-time skill alignment percentages before submitting your CV.</p>
                      </div>
                    </div>

                    <div className="auth-feature-item">
                      <div className="feature-icon-badge">
                        <Icon name="check" size={14} />
                      </div>
                      <div>
                        <strong>Real-time Interview Tracking</strong>
                        <p>Get immediate notifications when recruiters review your profile.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Stat Strip */}
              <div className="auth-stats-strip">
                <div className="auth-stat-col">
                  <strong>130+</strong>
                  <span>Active Openings</span>
                </div>
                <div className="auth-stat-col">
                  <strong>57+</strong>
                  <span>Top Employers</span>
                </div>
                <div className="auth-stat-col">
                  <strong>45k+</strong>
                  <span>Active Seekers</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Form Panel */}
          <section className="auth-form-panel">
            <div className="auth-form-inner">
              <div className="auth-form-header">
                <span className="eyebrow-accent">
                  {register ? "FREE REGISTRATION" : "SECURE PORTAL"}
                </span>
                <h1 className="auth-form-title">
                  {register
                    ? isRecruiter
                      ? "Create Employer Account"
                      : "Create Jobseeker Account"
                    : "Sign in to HireHub"}
                </h1>
                <p className="auth-form-subtitle">
                  {register
                    ? isRecruiter
                      ? "Post vacancies and hire candidates across Nepal."
                      : "Build your professional profile and land your dream job."
                    : "Enter your verified credentials to access your dashboard."}
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="auth-role-tabs">
                <button
                  type="button"
                  className={`role-tab-btn ${!isRecruiter ? "active" : ""}`}
                  onClick={() => {
                    setRole("user");
                    setError("");
                  }}
                >
                  <Icon name="user" size={16} />
                  <div>
                    <strong>Job Seeker</strong>
                    <span>Browse &amp; Apply</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`role-tab-btn ${isRecruiter ? "active" : ""}`}
                  onClick={() => {
                    setRole("recruiter");
                    setError("");
                  }}
                >
                  <Icon name="building" size={16} />
                  <div>
                    <strong>Employer</strong>
                    <span>Post &amp; Hire</span>
                  </div>
                </button>
              </div>

              {/* Quick Demo Credentials Bar */}
              <div className="auth-demo-banner">
                <span className="demo-label">Quick Demo:</span>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => handleDemoFill("user")}
                >
                  Demo Jobseeker
                </button>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => handleDemoFill("recruiter")}
                >
                  Demo Recruiter
                </button>
              </div>

              {/* Alert Feedback */}
              {error && (
                <div className="auth-alert error">
                  <Icon name="close" size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="auth-alert success">
                  <Icon name="check" size={16} />
                  <span>{success}</span>
                </div>
              )}

              {/* Form */}
              <form className="auth-form" onSubmit={handleSubmit}>
                {register && (
                  <div className="auth-field">
                    <label htmlFor="auth-name">
                      {isRecruiter ? "Registered Organization Name" : "Full Legal Name"}
                    </label>
                    <div className="input-group-box">
                      <span className="input-icon">
                        <Icon name={isRecruiter ? "building" : "user"} size={16} />
                      </span>
                      <input
                        id="auth-name"
                        required
                        type="text"
                        placeholder={isRecruiter ? "e.g. WorldLink Communications" : "e.g. Aarav Sharma"}
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="auth-email">
                    {isRecruiter ? "Official Work Email" : "Email Address"}
                  </label>
                  <div className="input-group-box">
                    <span className="input-icon">
                      <Icon name="mail" size={16} />
                    </span>
                    <input
                      id="auth-email"
                      required
                      type="email"
                      placeholder={isRecruiter ? "careers@company.com.np" : "name@example.com"}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                {register && (
                  <div className="auth-field">
                    <label htmlFor="auth-phone">Mobile Contact Number</label>
                    <div className="input-group-box">
                      <span className="input-addon">+977</span>
                      <input
                        id="auth-phone"
                        required
                        type="tel"
                        placeholder="98XXXXXXXX"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <div className="field-label-row">
                    <label htmlFor="auth-password">Password</label>
                    {!register && (
                      <span className="forgot-password-link" title="Contact administrator for password resets">
                        Forgot Password?
                      </span>
                    )}
                  </div>
                  <div className="input-group-box">
                    <span className="input-icon">
                      <Icon name="lock" size={16} />
                    </span>
                    <input
                      id="auth-password"
                      required
                      minLength={6}
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                    </button>
                  </div>
                </div>

                {!register && (
                  <div className="auth-checkbox-row">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Keep me signed in on this computer</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button full-width auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{register ? "Create Free Account" : "Sign In to Account"}</span>
                      <Icon name="arrow" size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom switch */}
              <div className="auth-bottom-switch">
                {register ? (
                  <p>
                    Already have an account?{" "}
                    <Link href="/login" className="accent-link">
                      Sign in here →
                    </Link>
                  </p>
                ) : (
                  <p>
                    New to HireHub?{" "}
                    <Link href="/register" className="accent-link">
                      Create a free account →
                    </Link>
                  </p>
                )}
              </div>

              {/* Security note */}
              <div className="auth-trust-note">
                <Icon name="badgeCheck" size={14} />
                <span>256-Bit SSL Encrypted. Your details are safe with HireHub.</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
