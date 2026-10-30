"use client";

import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import { Icon } from "@/src/components/Icon";

export default function EmployerZonePage() {
  return (
    <PageShell>
      <div className="employer-zone-page">
        {/* Hero Section */}
        <section className="ez-hero">
          <div className="ez-hero-copy">
            <span className="eyebrow-accent">HIREHUB EMPLOYER ZONE</span>
            <h1>
              Hire Top Talent in Nepal <br />
              <em>Faster &amp; Smarter.</em>
            </h1>
            <p>
              Connect with over 45,000+ active candidates. Post vacancies, filter verified applicants, and streamline your recruitment workflow with intelligent matching tools.
            </p>
            <div className="ez-hero-actions">
              <Link href="/recruiter" className="primary-button">
                Go to Employer Workspace <Icon name="arrow" size={16} />
              </Link>
              <Link href="/login" className="secondary-button">
                Recruiter Sign In
              </Link>
            </div>
          </div>

          <div className="ez-hero-stat-card">
            <div className="ez-stat-item">
              <strong>45,000+</strong>
              <span>Registered Jobseekers</span>
            </div>
            <div className="ez-stat-item">
              <strong>94%</strong>
              <span>Successful Candidate Matches</span>
            </div>
            <div className="ez-stat-item">
              <strong>&lt; 24h</strong>
              <span>Average Time to First Qualified Applicant</span>
            </div>
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section className="ez-solutions-section" id="solutions">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">COMPREHENSIVE SOLUTIONS</span>
              <h2 className="section-main-heading">Why Leading Nepali Employers Trust HireHub</h2>
            </div>
          </div>

          <div className="ez-solutions-grid">
            <div className="ez-solution-card">
              <div className="solution-icon-box">
                <Icon name="briefcase" size={24} />
              </div>
              <h3>Targeted Vacancy Postings</h3>
              <p>
                Reach active candidates across specialized sectors including Information Technology, Banking, Healthcare, Engineering, and Media.
              </p>
            </div>

            <div className="ez-solution-card">
              <div className="solution-icon-box">
                <Icon name="spark" size={24} />
              </div>
              <h3>AI Candidate Screening</h3>
              <p>
                Intelligent algorithm ranks applicants based on required skills, experience level, and competencies to eliminate resume screening fatigue.
              </p>
            </div>

            <div className="ez-solution-card">
              <div className="solution-icon-box">
                <Icon name="user" size={24} />
              </div>
              <h3>Built-in Applicant Tracking</h3>
              <p>
                Review candidate profiles, schedule interviews, and update application statuses from a unified, intuitive employer workspace.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing & Posting Plans (Merojob Style) */}
        <section className="ez-pricing-section" id="pricing">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">RECRUITMENT PACKAGES</span>
              <h2 className="section-main-heading">Choose Your Hiring Package</h2>
            </div>
          </div>

          <div className="ez-pricing-grid">
            <div className="ez-price-card">
              <span className="price-plan-name">Standard Vacancy</span>
              <div className="price-amount">
                <strong>Free</strong>
                <span>/ vacancy</span>
              </div>
              <p className="price-desc">Perfect for single job postings and small startups hiring immediately.</p>
              <ul className="price-features">
                <li><Icon name="check" size={14} /> 15-day live job listing</li>
                <li><Icon name="check" size={14} /> Basic applicant tracking</li>
                <li><Icon name="check" size={14} /> Email notifications on applications</li>
              </ul>
              <Link href="/recruiter" className="secondary-button full-width">
                Post Free Vacancy
              </Link>
            </div>

            <div className="ez-price-card featured">
              <span className="featured-flag">Most Popular</span>
              <span className="price-plan-name">Hot Job Vacancy</span>
              <div className="price-amount">
                <strong>$49</strong>
                <span>/ 30 days</span>
              </div>
              <p className="price-desc">Maximized visibility on homepage and top of search results for high-priority hiring.</p>
              <ul className="price-features">
                <li><Icon name="check" size={14} /> 30-day premium vacancy</li>
                <li><Icon name="check" size={14} /> Homepage Top Job banner placement</li>
                <li><Icon name="check" size={14} /> Priority applicant email alerts</li>
                <li><Icon name="check" size={14} /> AI candidate skill compatibility score</li>
              </ul>
              <Link href="/recruiter" className="primary-button full-width">
                Post Hot Job
              </Link>
            </div>

            <div className="ez-price-card">
              <span className="price-plan-name">Enterprise ATS</span>
              <div className="price-amount">
                <strong>$199</strong>
                <span>/ annual</span>
              </div>
              <p className="price-desc">Complete recruitment suite for growing organizations with multiple open roles.</p>
              <ul className="price-features">
                <li><Icon name="check" size={14} /> Unlimited vacancy listings</li>
                <li><Icon name="check" size={14} /> Verified employer branding badge</li>
                <li><Icon name="check" size={14} /> Dedicated recruitment support</li>
                <li><Icon name="check" size={14} /> Full candidate database search</li>
              </ul>
              <Link href="/recruiter" className="secondary-button full-width">
                Get Enterprise Access
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="ez-faq-section" id="faq">
          <div className="section-title-row">
            <div>
              <span className="eyebrow-accent">FREQUENTLY ASKED QUESTIONS</span>
              <h2 className="section-main-heading">Employer FAQs</h2>
            </div>
          </div>

          <div className="ez-faq-grid">
            <div className="faq-item">
              <h4>How quickly will my vacancy go live?</h4>
              <p>Your vacancy goes live immediately upon submission and is automatically indexed in search results and category pages.</p>
            </div>
            <div className="faq-item">
              <h4>Can I review applicants and update their hiring status?</h4>
              <p>Yes, from your Employer Workspace, you can review each applicant&apos;s details, resume, and change their status between Applied, Interview, Hired, or Rejected.</p>
            </div>
            <div className="faq-item">
              <h4>Can multiple recruiters manage the same company profile?</h4>
              <p>Yes, multiple recruiters can manage vacancies for the same company by using the company login credentials.</p>
            </div>
            <div className="faq-item">
              <h4>What kinds of organizations hire on HireHub?</h4>
              <p>From ISPs and tech consultancies to banks, hospitals, and educational NGOs across Nepal.</p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
