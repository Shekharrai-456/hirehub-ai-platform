import type { Application, Company, Job, User } from "@/src/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type Options = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { body, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...requestOptions.headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body });
const put = <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body });

function listOrEmpty<T>(requestFunction: () => Promise<{ applications?: T[] }>) {
  return requestFunction()
    .then((response) => response.applications ?? [])
    .catch((error: unknown) => {
      if (error instanceof Error && error.message.includes("No ")) return [];
      throw error;
    });
}

export async function getJobs(params?: {
  keyword?: string;
  location?: string;
  jobType?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.keyword) searchParams.set("keyword", params.keyword);
  if (params?.location) searchParams.set("location", params.location);
  if (params?.jobType && params.jobType !== "all") searchParams.set("jobType", params.jobType);
  const qs = searchParams.toString();
  const response = await get<{ jobs: Job[] }>(`/job/all${qs ? `?${qs}` : ""}`);
  return response.jobs ?? [];
}

export async function getCompanies() {
  const response = await get<{ companies: Company[] }>("/company/all").catch(() => ({ companies: [] }));
  return response.companies ?? [];
}

export async function getJob(id: string) {
  const response = await get<{ job: Job }>(`/job/${id}`);
  return response.job ?? null;
}

export async function getCompanyJobs(companyId: string) {
  const response = await get<{ jobs: Job[] }>(`/job/company/${companyId}`).catch((error: unknown) => {
    if (error instanceof Error && error.message === "No jobs found for this company") return { jobs: [] };
    throw error;
  });
  return response.jobs ?? [];
}

export function loginUser(email: string, password: string, role: string) {
  return post<{ user: User; message: string }>("/user/login", { email, password, role });
}

export function registerUser(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}) {
  return post<{ message: string }>("/user/register", data);
}

export function logoutUser() {
  return post<{ message: string }>("/user/logout");
}

export function applyForJob(jobId: string) {
  return post<{ message: string }>(`/application/apply/${jobId}`);
}

export function getApplications(userId: string) {
  return listOrEmpty<Application>(() =>
    get<{ applications: Application[] }>(`/application/user/${userId}`),
  );
}

export function getApplicants(jobId: string) {
  return listOrEmpty<Application>(() =>
    get<{ applications: Application[] }>(`/application/job/${jobId}`),
  );
}

export function updateApplicationStatus(
  applicationId: string,
  status: Application["status"],
) {
  return put<{ application: Application }>(
    `/application/${applicationId}/status`,
    { applicationId, status },
  );
}

export function updateUserProfile(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  skills: string;
}) {
  return post<{ user: User }>("/user/profile/update", data);
}

export function createJob(data: {
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
  return post<{ job: Job }>("/job/create", data);
}

export function loginCompany(email: string, password: string) {
  return post<{ company: Company; message: string }>("/company/login", { email, password });
}

export function registerCompany(data: {
  companyName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  return post<{ message: string }>("/company/register", data);
}

export function logoutCompany() {
  return post<{ message: string }>("/company/logout");
}

export function updateCompanyProfile(data: {
  companyName: string;
  email: string;
  phoneNumber: string;
}) {
  return post<{ company: Company }>("/company/profile/update", data);
}
