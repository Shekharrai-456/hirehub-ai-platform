export type Role = "user" | "recruiter" | "admin";

export type Company = {
  _id: string;
  companyName: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  industry?: string;
  logo?: string;
  website?: string;
  size?: string;
  description?: string;
};

export type Application = {
  _id: string;
  status: "applied" | "interview" | "hired" | "rejected" | "withdrawn";
  applicant: User | string;
  job: Job | string;
  createdAt?: string;
};

export type Job = {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "internship";
  position: string;
  experience: string;
  skills: string[];
  category?: string;
  deadline?: string;
  featured?: boolean;
  company: Company | string;
  createdAt?: string;
};

export type User = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | number;
  role: Role;
  profile?: {
    bio?: string;
    skills?: string[];
    resume?: string;
    resumeOriginalName?: string;
    company?: string | Company;
    profilePicture?: string;
  };
  savedJobs?: (string | Job)[];
};

