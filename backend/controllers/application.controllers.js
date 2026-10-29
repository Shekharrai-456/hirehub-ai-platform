import { Job } from "../src/models/job.model.js";
import { Application } from "../src/models/application.model.js";

export const applyJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.id;
        if (!jobId || !userId) {
            return res
                .status(400)
                .json({ message: "Job ID and User ID are required" });
        }

        // Check if the job exists
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check the application collection because job.applications stores application IDs.
        const hasApplied = await Application.exists({ applicant: userId, job: jobId });
        if (hasApplied) {
            return res
                .status(400)
                .json({ message: "User has already applied to this job" });
        }

        // Create a new application
        const application = new Application({
            applicant: userId,
            job: jobId,
            status: "applied",
        });

        await application.save();

        // Add the user to the job's applications
        job.applications.push(application._id);
        await job.save();

        return res.status(201).json({
            message: "Application submitted successfully",
            success: true,
            application,
        });
    } catch (error) {
        console.error("Error applying to job:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// get applied jobs for a user
export const getAppliedJobsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch applications for the user
        const applications = await Application.find({ applicant: userId })
            .populate("job", "title description location") // Populate job details
            .populate("applicant", "fullName email phoneNumber role"); // Populate applicant details

            if (!applications || applications.length === 0) {
                return res.status(404).json({
                    message: "No applications found for this user",
                    success: false
                });
            }
            
            res.status(200).json({ applications });

    } catch (error) {   
        console.error("Error fetching applied jobs for user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// get applicants for a job
export const getApplicantsForJob = async (req, res) => {

    try {
        const jobId = req.params.jobId;

        // Fetch applications for the job
        const applications = await Application.find({ job: jobId })
            .populate("applicant", "fullName email phoneNumber role") // Populate applicant details
        
            if (!applications || applications.length === 0) {   
            return res.status(404).json({
                message: "No applicants found for this job",
                success: false
            });
        }

        return res.status(200).json({ applications });

    } catch (error) {
        console.error("Error fetching applicants for job:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};


export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId, status } = req.body;

        // Validate status
        const validStatuses = ["applied", "interview", "hired", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Valid statuses are: applied, interview, hired, rejected",
                success: false
            });
        }

        // Find the application by ID
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }

        // Update the status
        application.status = status;
        await application.save();

        return res.status(200).json({
            message: "Application status updated successfully",
            success: true,
            application
        });

    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};
