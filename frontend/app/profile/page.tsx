"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { PageShell } from "@/src/components/PageShell";
import { updateUserProfile } from "@/src/lib/api";
import type { User } from "@/src/types";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const savedUser = window.localStorage.getItem("hirehub-user");
    return savedUser ? JSON.parse(savedUser) as User : null;
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
      <section className="form-page-heading"><p className="eyebrow">Your profile</p><h1>Tell employers<br /><em>your story.</em></h1><p>This page is ready to connect with the profile update endpoint later.</p></section>
      {!user && <div className="empty-state"><p>Please sign in before editing your profile.</p></div>}
      {user && <form className="profile-form" onSubmit={saveProfile}>
        <label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label>Phone number<input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required /></label><label>About you<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} /></label><label>Skills<input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Next.js" /></label>{message && <p className="form-message">{message}</p>}<button className="primary-button">{saved ? "Profile saved ✓" : "Save profile"}</button>
      </form>
      }
    </PageShell>
  );
}
