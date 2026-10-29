import { JobDetails } from "@/src/components/JobDetails";

export const instant = false;

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetails id={id} />;
}
