"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { loginCompany, loginUser, registerCompany, registerUser } from "@/src/lib/api";
import type { Company, Role, User } from "@/src/types";

export function AuthPage({ register = false }: { register?: boolean }) {
  const [signedIn, setSignedIn] = useState<User | Company | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phoneNumber: "", password: "" });
  const [role, setRole] = useState<Role>("user");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      if (register && role === "recruiter") {
        await registerCompany({
          companyName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
        });
        setMessage("Company created. You can now sign in.");
      } else if (register) {
        await registerUser({ ...form, role });
        setMessage("Account created. You can now sign in.");
      } else if (role === "recruiter") {
        const result = await loginCompany(form.email, form.password);
        setSignedIn(result.company);
        window.localStorage.setItem("hirehub-company", JSON.stringify(result.company));
        setMessage("You are signed in. You can now manage jobs.");
      } else {
        const result = await loginUser(form.email, form.password, role);
        setSignedIn(result.user);
        window.localStorage.setItem("hirehub-user", JSON.stringify(result.user));
        setMessage("You are signed in. You can now explore jobs.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="brand auth-brand" href="/"><span className="logo-mark">H</span><span>hire<span className="brand-accent">hub</span></span></Link>
        <p className="eyebrow">{register ? "Join HireHub" : "Welcome back"}</p>
        <h1>{register ? "Create your account." : "Sign in to continue."}</h1>
        <p className="auth-help">{register ? "Create a profile and find your next opportunity." : "Save jobs, apply faster, and track your applications."}</p>
        <form className="simple-form" onSubmit={submit}>
          {register && <label>{role === "recruiter" ? "Company name" : "Full name"}<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>}
          <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          {register && <label>Phone number<input required value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label>}
          <label>Password<input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label>Account type<select value={role} onChange={(e) => setRole(e.target.value as Role)}><option value="user">Job seeker</option><option value="recruiter">Recruiter</option></select></label>
          {message && <p className="form-message">{message}</p>}
          {signedIn ? <Link className="primary-button full-width" href={role === "recruiter" ? "/recruiter" : "/dashboard"}>Go to dashboard →</Link> : <button className="primary-button full-width">{register ? "Create account" : "Sign in"} →</button>}
        </form>
        <p className="auth-switch">{register ? "Already have an account?" : "New to HireHub?"} <Link href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p>
      </div>
    </div>
  );
}
