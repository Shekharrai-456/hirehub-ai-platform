"use client";

import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/src/components/Icon";
import { loginCompany, loginUser, registerCompany, registerUser } from "@/src/lib/api";
import type { Role, User } from "@/src/types";

type AuthMode = "login" | "register";

type FormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

type AuthModalProps = {
  onClose: () => void;
  onLogin: (user: User) => void;
};

const emptyForm: FormValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
};

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("user");
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRegistering = mode === "register";
  const isRecruiter = role === "recruiter";

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
  }

  function handleDemoFill(demoRole: "user" | "recruiter") {
    setError("");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRecruiter) {
        if (isRegistering) {
          await registerCompany({
            companyName: form.fullName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password,
          });
          setMode("login");
          setForm((currentForm) => ({
            ...emptyForm,
            email: currentForm.email,
          }));
          return;
        } else {
          const response = await loginCompany(form.email, form.password);
          window.localStorage.setItem("hirehub-company", JSON.stringify(response.company));
          onClose();
          router.push("/recruiter");
          router.refresh();
          return;
        }
      }

      if (isRegistering) {
        await registerUser({ ...form, role: "user" });
        setMode("login");
        setForm((currentForm) => ({
          ...emptyForm,
          email: currentForm.email,
        }));
        return;
      }

      const response = await loginUser(form.email, form.password, "user");
      window.localStorage.setItem("hirehub-user", JSON.stringify(response.user));
      onLogin(response.user);
      onClose();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete the request.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section className="auth-modal modal-enhanced" aria-labelledby="auth-title">
        <button
          type="button"
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Close authentication dialog"
        >
          <Icon name="close" size={20} />
        </button>

        <div className="modal-heading">
          <div className="brand modal-brand">
            <span className="logo-mark">H</span>
            <span>hire<span className="brand-accent">hub</span></span>
          </div>
          <span className="eyebrow-accent">
            {isRegistering ? "CREATE ACCOUNT" : "WELCOME BACK"}
          </span>
          <h2 id="auth-title">
            {isRegistering
              ? isRecruiter
                ? "Register as Employer"
                : "Register as Candidate"
              : isRecruiter
                ? "Sign In to Recruiter Hub"
                : "Sign In to Candidate Portal"}
          </h2>
        </div>

        {/* Mode Toggle (Sign in vs Register) */}
        <div className="segmented">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={isRegistering ? "active" : ""}
            onClick={() => changeMode("register")}
          >
            Create Account
          </button>
        </div>

        {/* Role Toggle (Job Seeker vs Employer) */}
        <div className="modal-role-row">
          <button
            type="button"
            className={`modal-role-pill ${!isRecruiter ? "active" : ""}`}
            onClick={() => setRole("user")}
          >
            <Icon name="user" size={14} />
            <span>Job Seeker</span>
          </button>
          <button
            type="button"
            className={`modal-role-pill ${isRecruiter ? "active" : ""}`}
            onClick={() => setRole("recruiter")}
          >
            <Icon name="building" size={14} />
            <span>Employer</span>
          </button>
        </div>

        {/* Demo Credentials Quick Pill */}
        <div className="modal-demo-strip">
          <span>Demo:</span>
          <button type="button" onClick={() => handleDemoFill("user")}>
            Candidate
          </button>
          <button type="button" onClick={() => handleDemoFill("recruiter")}>
            Recruiter
          </button>
        </div>

        {error && (
          <div className="auth-alert error compact" role="alert">
            <Icon name="close" size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {isRegistering && (
            <div className="auth-field compact">
              <label>
                {isRecruiter ? "Company Name" : "Full Name"}
              </label>
              <div className="input-group-box">
                <span className="input-icon">
                  <Icon name={isRecruiter ? "building" : "user"} size={14} />
                </span>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField}
                  required
                  placeholder={isRecruiter ? "e.g. WorldLink Communications" : "e.g. Aarav Sharma"}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="auth-field compact">
            <label>Email Address</label>
            <div className="input-group-box">
              <span className="input-icon">
                <Icon name="mail" size={14} />
              </span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                placeholder={isRecruiter ? "careers@company.com.np" : "name@example.com"}
                autoComplete="email"
              />
            </div>
          </div>

          {isRegistering && (
            <div className="auth-field compact">
              <label>Phone Number</label>
              <div className="input-group-box">
                <span className="input-addon">+977</span>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={updateField}
                  required
                  placeholder="98XXXXXXXX"
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          <div className="auth-field compact">
            <label>Password</label>
            <div className="input-group-box">
              <span className="input-icon">
                <Icon name="lock" size={14} />
              </span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                required
                minLength={6}
                placeholder="At least 6 characters"
                autoComplete={isRegistering ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={14} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="primary-button full-width"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Authenticating..."
              : isRegistering
                ? "Create Account"
                : "Sign In"}
            <Icon name="arrow" size={15} />
          </button>
        </form>

        <div className="modal-trust-footer">
          <Icon name="badgeCheck" size={13} />
          <span>Verified &amp; Secure Authentication</span>
        </div>
      </section>
    </div>
  );
}
