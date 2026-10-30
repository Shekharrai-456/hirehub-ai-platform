import Link from "next/link";
import { Icon } from "./Icon";

export function SiteFooter() {
  return (
    <footer className="merojob-footer">
      <div className="footer-top-grid">
        <div className="footer-brand-col">
          <Link className="brand" href="/">
            <span className="logo-mark">H</span>
            <span>hire<span className="brand-accent">hub</span></span>
          </Link>
          <p className="footer-desc">
            Nepal&apos;s premier career and recruitment destination. Connecting ambitious talent with verified organizations through intelligent matching.
          </p>
          <div className="footer-contact-info">
            <span><Icon name="map" size={14} /> Kathmandu &amp; Lalitpur, Nepal</span>
            <span><Icon name="phone" size={14} /> +977-1-4422330 / 9801234567</span>
            <span><Icon name="mail" size={14} /> support@hirehub.com.np</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>For Jobseekers</h4>
          <ul>
            <li><Link href="/jobs">Browse All Jobs</Link></li>
            <li><Link href="/jobs?category=IT">Jobs by Function</Link></li>
            <li><Link href="/jobs?location=Kathmandu">Jobs by Location</Link></li>
            <li><Link href="/dashboard">Application Tracker</Link></li>
            <li><Link href="/profile">Candidate Profile</Link></li>
            <li><Link href="/login">Jobseeker Sign In</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>For Employers</h4>
          <ul>
            <li><Link href="/recruiter">Post a Job Vacancy</Link></li>
            <li><Link href="/employer-zone">Employer Zone Overview</Link></li>
            <li><Link href="/recruiter">Applicant Management</Link></li>
            <li><Link href="/recruiter">Candidate Search</Link></li>
            <li><Link href="/login">Recruiter Sign In</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>About HireHub</h4>
          <ul>
            <li><Link href="/employer-zone#about">About Us</Link></li>
            <li><Link href="/employer-zone#solutions">Hiring Solutions</Link></li>
            <li><Link href="/employer-zone#faq">Employer FAQ</Link></li>
            <li><Link href="/employer-zone#terms">Terms of Service</Link></li>
            <li><Link href="/employer-zone#privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>© 2025 HireHub AI Platform. All rights reserved. Inspired by Nepal&apos;s job ecosystem.</p>
        <div className="footer-badges">
          <span className="pill-badge"><Icon name="badgeCheck" size={13} /> Verified Employers</span>
          <span className="pill-badge"><Icon name="spark" size={13} /> AI Match Engine</span>
        </div>
      </div>
    </footer>
  );
}
