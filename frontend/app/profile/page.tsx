"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";
import { updateUserProfile } from "@/src/lib/api";
import type { User } from "@/src/types";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedUser = window.localStorage.getItem("hirehub-user");
      return savedUser ? (JSON.parse(savedUser) as User) : null;
    } catch {
      return null;
    }
  });
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(() => ({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phoneNumber: String(user?.phoneNumber ?? ""),
    bio: user?.profile?.bio ?? "",
    skills: user?.profile?.skills?.join(", ") ?? "",
  }));

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await updateUserProfile(form);
      setUser(result.user);
      window.localStorage.setItem("hirehub-user", JSON.stringify(result.user));
      setSaved(true);
      setMessage("Profile saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    }
  }

  return (
    <PageShell>
      <div style={{ maxWidth: "680px", margin: "32px auto", padding: "0 20px" }}>
        <div style={{ marginBottom: "28px" }}>
          <span className="eyebrow-accent">CANDIDATE SETTINGS</span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "6px 0 8px", color: "var(--ink)" }}>
            Candidate Profile
          </h1>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: "14.5px" }}>
            Keep your credentials and competencies updated so verified employers can find and contact you.
          </p>
        </div>

        {!user ? (
          <div className="empty-state">
            <Icon name="lock" size={32} />
            <strong>Sign In Required</strong>
            <p>Please sign in before editing your candidate profile.</p>
            <Link className="primary-button compact" href="/login">
              Sign In to Account
            </Link>
          </div>
        ) : (
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-xl)",
              padding: "36px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div className="avatar-circle" style={{ width: "52px", height: "52px", fontSize: "20px" }}>
                  {(user.fullName || "U").slice(0, 1)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--ink)" }}>{user.fullName}</h3>
                  <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>{user.email}</span>
                </div>
              </div>
              <Link href="/jobseeker/overview" className="accent-link">
                Go to Dashboard →
              </Link>
            </div>

            <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-field-group">
                <label>Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Phone Number</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-field-group">
                <label>Professional Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  placeholder="Share your experience, passion, and career aspirations..."
                />
              </div>

              <div className="form-field-group">
                <label>Key Skills (comma separated)</label>
                <input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, TypeScript, Next.js, Node.js"
                />
              </div>

              {message && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--success-bg)",
                    color: "var(--success)",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {message}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <Link href="/jobseeker/overview" className="secondary-button">
                  Cancel
                </Link>
                <button type="submit" className="primary-button">
                  {saved ? "Profile Saved ✓" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PageShell>
  );
}
