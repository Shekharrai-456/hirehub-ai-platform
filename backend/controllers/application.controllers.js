import { Application } from "../src/models/application.model.js";
import { Job } from "../src/models/job.model.js";
import { failure, handleError, success } from "../src/utils/http.js";

const validStatuses = ["applied", "interview", "hired", "rejected"];

export async function applyJob(req, res) {
    try {
        const { jobId } = req.params;
        const userId = req.id;
        if (!jobId || !userId) return failure(res, 400, "Job ID and user are required");

        const job = await Job.findById(jobId);
        if (!job) return failure(res, 404, "Job not found");

        const alreadyApplied = await Application.exists({ applicant: userId, job: jobId });
        if (alreadyApplied) return failure(res, 400, "User has already applied to this job");

        const application = await Application.create({
            applicant: userId,
            job: jobId,
            status: "applied",
        });

        job.applications.push(application._id);
        await job.save();
        return success(res, 201, "Application submitted successfully", { application });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getAppliedJobsForUser(req, res) {
    try {
        const applications = await Application.find({ applicant: req.params.userId })
            .populate({
                path: "job",
                populate: {
                    path: "company",
                    select: "companyName email phoneNumber location industry logo",
                },
            })
            .populate("applicant", "fullName email phoneNumber role")
            .sort({ createdAt: -1 });

        return success(res, 200, "Applications retrieved successfully", { applications: applications || [] });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getApplicantsForJob(req, res) {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .populate("applicant", "fullName email phoneNumber role profile")
            .sort({ createdAt: -1 });

        return success(res, 200, "Applicants retrieved successfully", { applications: applications || [] });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function updateApplicationStatus(req, res) {
    try {
        const { applicationId, status } = req.body;
        const targetId = req.params.applicationId || applicationId;

        if (!validStatuses.includes(status)) {
            return failure(res, 400, `Invalid status. Use: ${validStatuses.join(", ")}`);
        }

        const application = await Application.findByIdAndUpdate(
            targetId,
            { status },
            { new: true, runValidators: true },
        );
        if (!application) return failure(res, 404, "Application not found");
        return success(res, 200, "Application status updated successfully", { application });
    } catch (error) {
        return handleError(res, error);
    }
}
