"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { logoutCompany, logoutUser } from "@/src/lib/api";
import { useIsMounted } from "@/src/lib/useMounted";
import type { Company, User } from "@/src/types";

function readHeaderSession(): { user: User | null; company: Company | null } {
  if (typeof window === "undefined") return { user: null, company: null };
  try {
    const savedUser = window.localStorage.getItem("hirehub-user");
    const savedComp = window.localStorage.getItem("hirehub-company");
    return {
      user: savedUser ? (JSON.parse(savedUser) as User) : null,
      company: savedComp ? (JSON.parse(savedComp) as Company) : null,
    };
  } catch {
    return { user: null, company: null };
  }
}

export function SiteHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useIsMounted();
  const session = mounted ? readHeaderSession() : { user: null, company: null };
  const user = session.user;
  const company = session.company;

  async function signOut() {
    if (company) {
      await logoutCompany().catch(() => undefined);
      window.localStorage.removeItem("hirehub-company");
    }
    if (user) {
      await logoutUser().catch(() => undefined);
      window.localStorage.removeItem("hirehub-user");
    }
    router.push("/");
    router.refresh();
  }

  return (
    <header className="merojob-header">
      <div className="header-inner">
        <div className="header-left">
          <Link className="brand" href="/">
            <span className="logo-mark">H</span>
            <span>hire<span className="brand-accent">hub</span></span>
          </Link>

          <nav className="header-nav">
            <Link href="/jobs" className="nav-link">
              Browse Jobs <Icon name="chevronDown" size={14} />
            </Link>
            <Link href="/jobs?category=Information+Technology" className="nav-link">
              IT &amp; Software
            </Link>
            <Link href="/jobs?location=Kathmandu" className="nav-link">
              Kathmandu Jobs
            </Link>
            <Link href="/#categories" className="nav-link">
              Categories
            </Link>
          </nav>
        </div>

        <div className="header-right">
          {mounted && company ? (
            <div className="auth-profile-row">
              <span className="profile-chip company">
                <Icon name="building" size={14} />
                <strong>{company.companyName}</strong>
              </span>
              <Link href="/recruiter" className="primary-button compact">
                Workspace
              </Link>
              <button className="text-button" onClick={signOut} title="Sign Out">
                <Icon name="logout" size={16} />
              </button>
            </div>
          ) : mounted && user ? (
            <div className="auth-profile-row">
              <Link href="/profile" className="profile-chip">
                <Icon name="user" size={14} />
                <span>Hi, <strong>{user.fullName.split(" ")[0]}</strong></span>
              </Link>
              <Link href="/dashboard" className="nav-link-btn">
                Applications
              </Link>
              <button className="text-button" onClick={signOut} title="Sign Out">
                <Icon name="logout" size={16} />
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link href="/login" className="login-btn">
                Sign in
              </Link>
              <Link href="/register" className="register-btn">
                Register
              </Link>
              <span className="nav-divider" />
              <Link href="/employer-zone" className="employer-zone-link">
                <span>For Employers</span>
                <Icon name="chevronRight" size={14} />
              </Link>
            </div>
          )}

          <button
            className="icon-button mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <Link href="/jobs" onClick={() => setMenuOpen(false)}>
              Browse All Jobs
            </Link>
            <Link href="/jobs?category=Information+Technology" onClick={() => setMenuOpen(false)}>
              IT &amp; Telecommunication Jobs
            </Link>
            <Link href="/jobs?location=Kathmandu" onClick={() => setMenuOpen(false)}>
              Jobs in Kathmandu
            </Link>
            <Link href="/#top-employers" onClick={() => setMenuOpen(false)}>
              Top Employers
            </Link>
            <Link href="/employer-zone" onClick={() => setMenuOpen(false)}>
              For Employers &amp; Post Job
            </Link>
            <hr />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                  My Applications
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)}>
                  Profile Settings
                </Link>
                <button className="text-button" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : company ? (
              <>
                <Link href="/recruiter" onClick={() => setMenuOpen(false)}>
                  Employer Workspace
                </Link>
                <button className="text-button" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link href="/login" className="login-btn full" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="register-btn full" onClick={() => setMenuOpen(false)}>
                  Create Free Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
