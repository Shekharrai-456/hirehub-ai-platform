export type Role = "user" | "recruiter" | "admin";

export type Company = {
  _id: string;
  companyName: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  industry?: string;
  logo?: string;
};

export type Application = {
  _id: string;
  status: "applied" | "interview" | "hired" | "rejected";
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
  };
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
} & T;
