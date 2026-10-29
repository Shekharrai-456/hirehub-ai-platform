import { Job } from "../src/models/job.model.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, location, jobType, experience, position, salary, skills, company } = req.body;
        const companyId = req.companyId || company;

        if (!title || !description || !location || !salary || !companyId || !requirements || !jobType || !experience || !position || !skills) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }   

        const job = await Job.create({
            title,
            description,
            requirements,
            location,
            jobType,
            experience,
            position,
            salary,
            skills: Array.isArray(skills) ? skills : skills.split(",").map((skill) => skill.trim()).filter(Boolean),
            company: companyId,
            ...(req.id ? { createdBy: req.id } : {}),
        });

        return res.status(201).json({
            message: "Job posted successfully",
            success: true,
            job
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

    
    
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate("company", "companyName email phoneNumber");
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found",
                success: false
            });
        }
        return res.status(200).json({
            message: "Jobs retrieved successfully",
            success: true,
            jobs
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};

export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate("company", "companyName email phoneNumber");
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job retrieved successfully",
            success: true,
            job
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};

export const getAdminJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate("company", "companyName email phoneNumber");
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found",
                success: false
            });
        }
        return res.status(200).json({
            message: "Jobs retrieved successfully",
            success: true,
            jobs
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const getJobsByCompanyId = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const jobs = await Job.find({ company: companyId }).populate("company", "companyName email phoneNumber");

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found for this company",
                success: false
            });
        }

        return res.status(200).json({
            message: "Jobs retrieved successfully",
            success: true,
            jobs
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { title, description, requirements, location, jobType, experience, position, salary } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });

        }
        job.title = title || job.title;
        job.description = description || job.description;
        job.requirements = requirements || job.requirements;

        job.location = location || job.location;
        job.jobType = jobType || job.jobType;
        job.experience = experience || job.experience;
        job.position = position || job.position;
        job.salary = salary || job.salary;

        await job.save();

        return res.status(200).json({
            message: "Job updated successfully",
            success: true,
            job
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};

export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findByIdAndDelete(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job deleted successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};