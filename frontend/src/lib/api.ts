import type { Application, Company, Job, User } from "@/src/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
export const API_BASE = API_URL.replace(/\/api\/v1\/?$/, "");

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

async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(data.message ?? "Upload failed");
  return data;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body });
const put = <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

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
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  companyId?: string;
  _id?: string;
}) {
  const targetId = data.companyId || data._id;
  const path = targetId ? `/company/profile/update/${targetId}` : "/company/profile/update";
  return post<{ company: Company }>(path, data);
}

export function getCompany(id: string) {
  return get<{ company: Company }>(`/company/${id}`).then((res) => res.company);
}

export function uploadResume(formData: FormData) {
  return uploadRequest<{ user: User; resume: string; resumeOriginalName: string; message: string }>(
    "/user/profile/resume",
    formData,
  );
}

export function uploadCompanyLogo(formData: FormData, companyId?: string) {
  const path = companyId ? `/company/profile/logo/${companyId}` : "/company/profile/logo";
  return uploadRequest<{ company: Company; logo: string; message: string }>(path, formData);
}

export function toggleBookmark(jobId: string) {
  return post<{ savedJobs: string[]; bookmarked: boolean; message: string }>(`/user/bookmark/${jobId}`);
}

export function getSavedJobs() {
  return get<{ savedJobs: Job[] }>("/user/saved-jobs").then((res) => res.savedJobs ?? []);
}

export function withdrawApplication(applicationId: string) {
  return del<{ message: string }>(`/application/withdraw/${applicationId}`);
}

