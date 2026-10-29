"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./Icon";
import { logoutCompany, logoutUser } from "@/src/lib/api";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionType, setSessionType] = useState<"user" | "company" | null>(() => {
    if (typeof window === "undefined") return null;
    if (window.localStorage.getItem("hirehub-company")) return "company";
    if (window.localStorage.getItem("hirehub-user")) return "user";
    return null;
  });

  async function signOut() {
    if (sessionType === "company") {
      await logoutCompany();
      window.localStorage.removeItem("hirehub-company");
    } else {
      await logoutUser();
      window.localStorage.removeItem("hirehub-user");
    }
    setSessionType(null);
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="logo-mark">H</span>
        <span>hire<span className="brand-accent">hub</span></span>
      </Link>
      <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
        <Icon name="menu" />
      </button>
      <nav className={menuOpen ? "site-nav open" : "site-nav"}>
        <Link href="/jobs">Find jobs</Link>
        <Link href="/dashboard">My applications</Link>
        <Link href="/recruiter">For employers</Link>
        <Link href="/profile">Profile</Link>
        {sessionType ? (
          <button className="text-button" onClick={signOut}><Icon name="logout" size={16} /> Sign out</button>
        ) : (
          <Link className="primary-button compact" href="/login">Sign in <Icon name="arrow" size={15} /></Link>
        )}
      </nav>
    </header>
  );
}
