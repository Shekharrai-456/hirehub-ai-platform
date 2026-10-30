
"use client";

import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/src/components/Icon";
import { loginUser, registerUser } from "@/src/lib/api";
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

  const isRegistering = mode === "register";

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (role === "recruiter") {
        if (isRegistering) {
          const { registerCompany } = await import("@/src/lib/api");
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
          const { loginCompany } = await import("@/src/lib/api");
          const response = await loginCompany(form.email, form.password);
          window.localStorage.setItem("hirehub-company", JSON.stringify(response.company));
          onClose();
          router.push("/recruiter");
          router.refresh();
          return;
        }
      }

      if (isRegistering) {
        await registerUser({ ...form, role });
        setMode("login");
        setForm((currentForm) => ({
          ...emptyForm,
          email: currentForm.email,
        }));
        return;
      }

      const response = await loginUser(form.email, form.password, role);
      onLogin(response.user);
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
      <section className="auth-modal" aria-labelledby="auth-title">
        <button
          type="button"
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Close authentication dialog"
        >
          <Icon name="close" />
        </button>

        <div className="modal-heading">
          <span className="logo-mark small">H</span>
          <p className="eyebrow">Welcome to HireHub</p>
          <h2 id="auth-title">
            {isRegistering ? "Create your account." : "Find work you love."}
          </h2>
        </div>

        <div className="segmented">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={isRegistering ? "active" : ""}
            onClick={() => changeMode("register")}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Full name
              <input
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              autoComplete="email"
            />
          </label>

          {isRegistering && (
            <label>
              Phone number
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={updateField}
                required
                autoComplete="tel"
              />
            </label>
          )}

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={6}
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
          </label>

          <label>
            Continue as
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="user">Job seeker</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : isRegistering
                ? "Create account"
                : "Sign in"}
            <Icon name="arrow" size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}
