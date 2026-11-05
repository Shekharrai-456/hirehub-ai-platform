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
            Nepal&apos;s intelligent career matching platform. Connecting ambitious candidates with verified organizations across tech, finance, and enterprise sectors.
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
            <li><Link href="/jobs">Browse All Vacancies</Link></li>
            <li><Link href="/jobs?category=Information+Technology">IT &amp; Software Jobs</Link></li>
            <li><Link href="/jobs?location=Kathmandu">Jobs in Kathmandu</Link></li>
            <li><Link href="/jobseeker/overview?tab=matched">AI Job Matches</Link></li>
            <li><Link href="/jobseeker/overview?tab=applications">Application Tracker</Link></li>
            <li><Link href="/login">Jobseeker Sign In</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>For Employers</h4>
          <ul>
            <li><Link href="/employer-zone">Employer Zone Overview</Link></li>
            <li><Link href="/recruiter">Post a Job Vacancy</Link></li>
            <li><Link href="/employer-zone#pricing">Recruitment Packages</Link></li>
            <li><Link href="/recruiter">Applicant Management</Link></li>
            <li><Link href="/login">Recruiter Sign In</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Platform &amp; Legal</h4>
          <ul>
            <li><Link href="/employer-zone#about">About HireHub</Link></li>
            <li><Link href="/employer-zone#solutions">Hiring Solutions</Link></li>
            <li><Link href="/employer-zone#faq">Employer FAQ</Link></li>
            <li><Link href="/employer-zone">Terms of Service</Link></li>
            <li><Link href="/employer-zone">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>© {new Date().getFullYear()} HireHub Platform. All rights reserved. Designed for Nepal&apos;s career ecosystem.</p>
        <div className="footer-badges">
          <span className="pill-badge"><Icon name="badgeCheck" size={13} /> 100% Verified Employers</span>
          <span className="pill-badge"><Icon name="spark" size={13} /> AI Match Engine</span>
        </div>
      </div>
    </footer>
  );
}
