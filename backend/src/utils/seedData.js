import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./db.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const sampleCompanies = [
  {
    companyName: "WorldLink Communications",
    email: "careers@worldlink.com.np",
    phoneNumber: "9801234567",
    location: "Jawalakhel, Lalitpur",
    website: "https://worldlink.com.np",
    industry: "Telecommunications & ISP",
    size: "1000+ employees",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
    description: "The largest internet and network service provider in Nepal, driving digital transformation.",
  },
  {
    companyName: "Stellar Cloud Solutions",
    email: "hr@stellarcloud.io",
    phoneNumber: "9841555666",
    location: "Kathmandu / Remote",
    website: "https://stellarcloud.io",
    industry: "Information Technology",
    size: "150-300 employees",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    description: "Next-generation cloud infrastructure, microservices, and AI workflow engineering firm.",
  },
  {
    companyName: "SuryaJyoti Life Insurance",
    email: "recruitment@suryajyoti.com",
    phoneNumber: "9812999888",
    location: "Biratnagar / Kathmandu",
    website: "https://suryajyoti.com",
    industry: "Banking & Financial Services",
    size: "500+ employees",
    logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&auto=format&fit=crop&q=80",
    description: "Leading insurance & financial risk management institution safeguarding modern futures.",
  },
  {
    companyName: "Alfa Healthcare & Diagnostics",
    email: "jobs@alfahealth.org",
    phoneNumber: "9803332211",
    location: "New Baneshwor, Kathmandu",
    website: "https://alfahealth.org",
    industry: "Healthcare & Pharmaceuticals",
    size: "200-500 employees",
    logo: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=120&auto=format&fit=crop&q=80",
    description: "State-of-the-art pathology, diagnostics, and outpatient healthcare services.",
  },
  {
    companyName: "Teach For Nepal & EduGlobal",
    email: "talent@teachfornepal.org",
    phoneNumber: "9841009988",
    location: "Patan, Lalitpur",
    website: "https://teachfornepal.org",
    industry: "Education & Non-Profit",
    size: "100-250 employees",
    logo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=120&auto=format&fit=crop&q=80",
    description: "A movement of outstanding university graduates and young professionals ending educational inequity.",
  },
  {
    companyName: "Creative Pulse Media",
    email: "careers@creativepulse.agency",
    phoneNumber: "9809988776",
    location: "Kathmandu / Hybrid",
    website: "https://creativepulse.agency",
    industry: "Advertising, Design & Media",
    size: "50-100 employees",
    logo: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=120&auto=format&fit=crop&q=80",
    description: "Award-winning full-funnel digital branding, UI/UX design, and content production studio.",
  },
];

const sampleJobs = [
  {
    companyIdx: 1,
    title: "Senior Full Stack Engineer (Next.js & Node)",
    category: "Information Technology",
    jobType: "full-time",
    position: "Senior Level",
    experience: "4-6 years",
    location: "Kathmandu / Hybrid",
    salary: 120000,
    deadline: "12 days remaining",
    featured: true,
    skills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    requirements: [
      "4+ years designing high-throughput web applications with Next.js and Node.js.",
      "Deep understanding of distributed systems, REST APIs, and database performance tuning.",
      "Experience deploying cloud architectures on AWS/GCP with CI/CD automation.",
      "Strong communication and code review leadership skills.",
    ],
    description:
      "Join our core platform engineering team building next-generation recruitment and cloud tools. You will lead architectural decisions, build resilient APIs, and collaborate closely with product designers.",
  },
  {
    companyIdx: 0,
    title: "Network Security & NOC Lead",
    category: "Telecommunications & ISP",
    jobType: "full-time",
    position: "Mid Level",
    experience: "3-5 years",
    location: "Lalitpur",
    salary: 85000,
    deadline: "8 days remaining",
    featured: true,
    skills: ["BGP", "Cisco", "Fortinet", "Network Monitoring", "Routing Protocols"],
    requirements: [
      "Bachelor's degree in Computer Engineering, Electronics, or equivalent.",
      "CCNA/CCNP or equivalent industry certifications highly preferred.",
      "Proven troubleshooting skills in high-availability fiber network infrastructure.",
    ],
    description:
      "Oversee 24/7 network operations center operations, mitigate distributed network incidents, and implement carrier-grade firewall protocols across nationwide hubs.",
  },
  {
    companyIdx: 2,
    title: "Financial Risk & Investment Analyst",
    category: "Banking & Financial Services",
    jobType: "full-time",
    position: "Mid Level",
    experience: "2-4 years",
    location: "Kathmandu",
    salary: 75000,
    deadline: "18 days remaining",
    featured: false,
    skills: ["Financial Modeling", "Portfolio Analytics", "Risk Assessment", "Excel/VBA", "PowerBI"],
    requirements: [
      "Master's/Bachelor's in Finance, Economics, or CFA level 1 candidate.",
      "Strong econometric modeling and investment valuation capabilities.",
      "Familiarity with regulatory insurance investment guidelines.",
    ],
    description:
      "Analyze institutional portfolios, formulate yield maximization plans, and present actuarial stress testing reports to senior executive management.",
  },
  {
    companyIdx: 3,
    title: "Senior Medical Biochemist & Lab Supervisor",
    category: "Healthcare & Pharmaceuticals",
    jobType: "full-time",
    position: "Senior Level",
    experience: "3+ years",
    location: "Kathmandu",
    salary: 95000,
    deadline: "5 days remaining",
    featured: true,
    skills: ["Clinical Biochemistry", "Quality Control", "Automated Analyzers", "ISO 15189"],
    requirements: [
      "M.Sc in Medical Biochemistry with registered NHPC license.",
      "Experience running and maintaining automated chemiluminescence equipment.",
      "High attention to quality control protocols and laboratory safety audits.",
    ],
    description:
      "Lead our central reference clinical laboratory, evaluate complex diagnostic assays, and guide a team of medical lab technologists in delivering clinical precision.",
  },
  {
    companyIdx: 5,
    title: "Lead UI/UX Designer & Design Systems",
    category: "Advertising, Design & Media",
    jobType: "full-time",
    position: "Mid Level",
    experience: "3-5 years",
    location: "Remote / Kathmandu",
    salary: 90000,
    deadline: "14 days remaining",
    featured: true,
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Design Tokens"],
    requirements: [
      "Proven portfolio showcasing responsive digital SaaS product design and design systems.",
      "Mastery of Figma component libraries, auto-layout, and interactive micro-prototypes.",
      "Ability to translate complex user journeys into intuitive, delightful interfaces.",
    ],
    description:
      "Craft visually stunning, high-converting product interfaces. You will define design tokens, create responsive design systems, and partner with front-end engineers to ensure pixel-perfect delivery.",
  },
  {
    companyIdx: 4,
    title: "Program Officer — STEM & Youth Leadership",
    category: "Education & Non-Profit",
    jobType: "contract",
    position: "Mid Level",
    experience: "2-3 years",
    location: "Lalitpur & Field Travel",
    salary: 60000,
    deadline: "20 days remaining",
    featured: false,
    skills: ["Curriculum Design", "Community Outreach", "Workshop Facilitation", "Project Management"],
    requirements: [
      "Passionate about education equity, youth mentorship, and grassroots development.",
      "Strong coordination capabilities with public school educators and local municipalities.",
      "Fluency in English and Nepali written reporting.",
    ],
    description:
      "Coordinate high-impact fellowship cohorts, design interactive STEM learning kits, and facilitate leadership development camps in public community schools.",
  },
  {
    companyIdx: 1,
    title: "AI / Machine Learning Engineer",
    category: "Information Technology",
    jobType: "full-time",
    position: "Mid-Senior Level",
    experience: "2-4 years",
    location: "Remote / Hybrid",
    salary: 135000,
    deadline: "25 days remaining",
    featured: true,
    skills: ["Python", "PyTorch", "LLMs", "Vector Databases", "FastAPI", "NLP"],
    requirements: [
      "Experience fine-tuning and orchestrating Large Language Models and embedding pipelines.",
      "Hands-on production deployment using FastAPI, Redis, and vector search (Pinecone/Milvus).",
      "Background in natural language processing and semantic information retrieval.",
    ],
    description:
      "Design intelligent matching algorithms, semantic resume parsers, and conversational assistants directly integrated into HireHub's AI candidate-matching engine.",
  },
  {
    companyIdx: 0,
    title: "Enterprise Sales & Key Account Executive",
    category: "Sales & Business Development",
    jobType: "full-time",
    position: "Senior Level",
    experience: "3-5 years",
    location: "Kathmandu",
    salary: 70000,
    deadline: "10 days remaining",
    featured: false,
    skills: ["B2B Sales", "Client Relationship", "Contract Negotiation", "CRM Management"],
    requirements: [
      "Strong background in technology or telecom enterprise solution sales.",
      "Proven track record of hitting and exceeding corporate revenue targets.",
      "Excellent executive presentation and relationship building skills.",
    ],
    description:
      "Drive enterprise data, bandwidth, and cybersecurity contracts for corporate institutions, banks, and multinational accounts across Nepal.",
  },
];

export async function seedDatabase() {
  await connectDB();

  const existingCompanies = await Company.countDocuments();
  if (existingCompanies >= 6) {
    console.log(`Database already has ${existingCompanies} companies. Skipping full seed.`);
    return;
  }

  console.log("Adding Merojob-inspired top employers and jobs into MongoDB...");
  const hashedPassword = await bcrypt.hash("hirehub123", 10);

  const createdCompanies = [];
  for (const comp of sampleCompanies) {
    const created = await Company.create({
      ...comp,
      password: hashedPassword,
    });
    createdCompanies.push(created);
  }
  console.log(`Created ${createdCompanies.length} companies.`);

  for (const jobData of sampleJobs) {
    const company = createdCompanies[jobData.companyIdx];
    await Job.create({
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      salary: jobData.salary,
      location: jobData.location,
      jobType: jobData.jobType,
      position: jobData.position,
      experience: jobData.experience,
      skills: jobData.skills,
      category: jobData.category,
      deadline: jobData.deadline,
      featured: jobData.featured,
      company: company._id,
    });
  }
  console.log(`Created ${sampleJobs.length} jobs.`);
}

if (process.argv[1].endsWith("seedData.js")) {
  seedDatabase()
    .then(() => {
      console.log("Seeding complete!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding error:", err);
      process.exit(1);
    });
}
