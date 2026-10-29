import type { Application, Company, Job, User } from "@/src/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type RequestOptions = RequestInit & { body?: BodyInit | null };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Something went wrong. Please try again.");
  }
  return payload;
}

export async function getJobs(): Promise<Job[]> {
  const payload = await request<{ jobs: Job[] }>("/job/all");
  return payload.jobs ?? [];
}

export async function getJob(id: string): Promise<Job | null> {
  const payload = await request<{ job: Job }>(`/job/${id}`);
  return payload.job ?? null;
}

export async function getCompanyJobs(companyId: string) {
  try {
    const payload = await request<{ jobs: Job[] }>(`/job/company/${companyId}`);
    return payload.jobs ?? [];
  } catch (error) {
    if (error instanceof Error && error.message === "No jobs found for this company") return [];
    throw error;
  }
}

export async function loginUser(email: string, password: string, role: string) {
  return request<{ user: User; message: string }>("/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export async function registerUser(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}) {
  return request<{ message: string }>("/user/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutUser() {
  return request<{ message: string }>("/user/logout", { method: "POST" });
}

export async function applyForJob(jobId: string) {
  return request<{ message: string }>("/application/apply/" + jobId, {
    method: "POST",
  });
}

export async function getApplications(userId: string) {
  try {
    const payload = await request<{ applications: Application[] }>(`/application/user/${userId}`);
    return payload.applications ?? [];
  } catch (error) {
    if (error instanceof Error && error.message === "No applications found for this user") return [];
    throw error;
  }
}

export async function getApplicants(jobId: string) {
  try {
    const payload = await request<{ applications: Application[] }>(`/application/job/${jobId}`);
    return payload.applications ?? [];
  } catch (error) {
    if (error instanceof Error && error.message === "No applicants found for this job") return [];
    throw error;
  }
}

export async function updateApplicationStatus(applicationId: string, status: Application["status"]) {
  return request<{ application: Application }>(`/application/${applicationId}/status`, {
    method: "PUT",
    body: JSON.stringify({ applicationId, status }),
  });
}

export async function updateUserProfile(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  skills: string;
}) {
  return request<{ user: User }>("/user/profile/update", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createJob(data: {
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  experience: string;
  position: string;
  salary: string;
  skills: string;
  company: string;
}) {
  return request<{ job: Job }>("/job/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginCompany(email: string, password: string) {
  return request<{ company: Company; message: string }>("/company/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerCompany(data: {
  companyName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  return request<{ message: string }>("/company/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutCompany() {
  return request<{ message: string }>("/company/logout", { method: "POST" });
}

export async function updateCompanyProfile(data: {
  companyName: string;
  email: string;
  phoneNumber: string;
}) {
  return request<{ company: Company }>("/company/profile/update", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
