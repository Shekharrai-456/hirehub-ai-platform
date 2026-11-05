"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
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
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="merojob-header">
        <div className="header-inner">
          <div className="header-left">
            <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
              <span className="logo-mark">H</span>
              <span>hire<span className="brand-accent">hub</span></span>
            </Link>

            <nav className="header-nav">
              <Link
                href="/jobs"
                className={`nav-link ${pathname === "/jobs" ? "active" : ""}`}
              >
                Browse Vacancies
              </Link>
              <Link
                href="/jobs?category=Information+Technology"
                className="nav-link"
              >
                IT &amp; Software
              </Link>
              <Link
                href="/jobs?location=Kathmandu"
                className="nav-link"
              >
                Kathmandu Jobs
              </Link>
              <Link
                href="/#categories"
                className="nav-link"
              >
                Categories
              </Link>
            </nav>
          </div>

          <div className="header-right">
            {mounted && company ? (
              <div className="auth-profile-row">
                <span className="profile-chip company">
                  <Icon name="building" size={14} />
                  <span>{company.companyName}</span>
                </span>
                <Link href="/recruiter" className="primary-button compact">
                  Workspace
                </Link>
                <button
                  type="button"
                  className="icon-button"
                  onClick={signOut}
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <Icon name="logout" size={16} />
                </button>
              </div>
            ) : mounted && user ? (
              <div className="auth-profile-row">
                <Link href="/jobseeker/overview" className="profile-chip">
                  <Icon name="user" size={14} />
                  <span>Hi, <strong>{user.fullName.split(" ")[0]}</strong></span>
                </Link>
                <Link href="/jobseeker/overview" className="nav-link-btn">
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="icon-button"
                  onClick={signOut}
                  title="Sign Out"
                  aria-label="Sign out"
                >
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
                  <Icon name="chevronRight" size={13} />
                </Link>
              </div>
            )}

            <button
              type="button"
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
              <Link href="/jobs" onClick={() => setMenuOpen(false)} className="nav-link">
                <Icon name="search" size={16} /> Browse All Vacancies
              </Link>
              <Link href="/jobs?category=Information+Technology" onClick={() => setMenuOpen(false)} className="nav-link">
                <Icon name="code" size={16} /> IT &amp; Software Jobs
              </Link>
              <Link href="/jobs?location=Kathmandu" onClick={() => setMenuOpen(false)} className="nav-link">
                <Icon name="map" size={16} /> Jobs in Kathmandu
              </Link>
              <Link href="/#top-employers" onClick={() => setMenuOpen(false)} className="nav-link">
                <Icon name="building" size={16} /> Top Verified Employers
              </Link>
              <Link href="/employer-zone" onClick={() => setMenuOpen(false)} className="nav-link">
                <Icon name="spark" size={16} /> Employer Zone &amp; Post Job
              </Link>

              {user ? (
                <>
                  <Link href="/jobseeker/overview" onClick={() => setMenuOpen(false)} className="nav-link">
                    <Icon name="user" size={16} /> Jobseeker Dashboard
                  </Link>
                  <Link href="/jobseeker/overview?tab=applications" onClick={() => setMenuOpen(false)} className="nav-link">
                    <Icon name="briefcase" size={16} /> My Applications
                  </Link>
                  <button type="button" className="danger-button" onClick={signOut}>
                    <Icon name="logout" size={14} /> Sign out
                  </button>
                </>
              ) : company ? (
                <>
                  <Link href="/recruiter" onClick={() => setMenuOpen(false)} className="nav-link">
                    <Icon name="briefcase" size={16} /> Employer Workspace
                  </Link>
                  <button type="button" className="danger-button" onClick={signOut}>
                    <Icon name="logout" size={14} /> Sign out
                  </button>
                </>
              ) : (
                <div className="mobile-auth-actions">
                  <Link href="/login" className="login-btn full-width" onClick={() => setMenuOpen(false)}>
                    Sign In to Account
                  </Link>
                  <Link href="/register" className="register-btn full-width" onClick={() => setMenuOpen(false)}>
                    Create Free Jobseeker Account
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
      {menuOpen && (
        <div
          className="mobile-drawer-overlay open"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
