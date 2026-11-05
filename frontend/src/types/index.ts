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

export type ApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "interview"
  | "hired"
  | "rejected";

export type Application = {
  _id: string;
  status: ApplicationStatus;
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

export type PreferredJob = {
  category?: string;
  location?: string;
  expectedSalary?: string;
  jobLevel?: string;
  jobType?: string;
};

export type Education = {
  degree: string;
  institution: string;
  graduationYear: string;
};

export type Experience = {
  title: string;
  company: string;
  duration: string;
};

export type JobAlert = {
  _id?: string;
  category: string;
  keyword: string;
  frequency: string;
  createdAt?: string;
};

export type UserProfile = {
  bio?: string;
  skills?: string[];
  resume?: string;
  resumeOriginalName?: string;
  profilePicture?: string;
  activelySeeking?: boolean;
  activelySeekingExpiresAt?: string;
  preferredJob?: PreferredJob;
  savedJobs?: string[];
  jobAlerts?: JobAlert[];
  education?: Education[];
  experience?: Experience[];
  profileViews?: number;
};

export type User = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | number;
  role: Role;
  profile?: UserProfile;
};
