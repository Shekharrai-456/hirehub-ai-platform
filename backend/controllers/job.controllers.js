import { Job } from "../src/models/job.model.js";
import { failure, handleError, success } from "../src/utils/http.js";

import mongoose from "mongoose";

const companyFields = "companyName email phoneNumber location industry logo website";

function toList(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export async function postJob(req, res) {
    try {
        const {
            title, description, requirements, location, jobType,
            experience, position, salary, skills, company,
            category, deadline, featured,
        } = req.body;
        const companyId = req.companyId || company;

        if (!title || !description || !requirements || !location || !jobType ||
            !experience || !position || !salary || !skills || !companyId) {
            return failure(res, 400, "All fields are required");
        }

        const job = await Job.create({
            title,
            description,
            requirements: toList(requirements),
            location,
            jobType,
            experience,
            position,
            salary: Number(salary) || 0,
            skills: toList(skills),
            company: companyId,
            category: category || "Information Technology",
            deadline: deadline || "30 days remaining",
            featured: Boolean(featured),
            ...(req.id && { createdBy: req.id }),
        });

        return success(res, 201, "Job posted successfully", { job });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getAllJobs(req, res) {
    try {
        const { keyword, location, jobType } = req.query;
        const query = {};

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { skills: { $in: [new RegExp(keyword, "i")] } },
            ];
        }
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        if (jobType && jobType !== "all") {
            query.jobType = jobType;
        }

        const jobs = await Job.find(query)
            .populate("company", companyFields)
            .sort({ createdAt: -1 });

        return success(res, 200, "Jobs retrieved successfully", { jobs: jobs || [] });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getJobById(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return failure(res, 404, "Job not found");
        }
        const job = await Job.findById(req.params.id).populate("company", companyFields);
        if (!job) return failure(res, 404, "Job not found");
        return success(res, 200, "Job retrieved successfully", { job });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getAdminJobs(req, res) {
    return getAllJobs(req, res);
}

export async function getJobsByCompanyId(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.companyId)) {
            return success(res, 200, "Jobs retrieved successfully", { jobs: [] });
        }
        const jobs = await Job.find({ company: req.params.companyId })
            .populate("company", companyFields)
            .sort({ createdAt: -1 });

        return success(res, 200, "Jobs retrieved successfully", { jobs: jobs || [] });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function updateJob(req, res) {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!job) return failure(res, 404, "Job not found");
        return success(res, 200, "Job updated successfully", { job });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function deleteJob(req, res) {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return failure(res, 404, "Job not found");
        return success(res, 200, "Job deleted successfully");
    } catch (error) {
        return handleError(res, error);
    }
}
