import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../src/models/user.model.js";
import { failure, handleError, success } from "../src/utils/http.js";

function publicUser(user) {
    return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
    };
}

export async function registerUser(req, res) {
    try {
        const { fullName, name, email, phoneNumber, password, role } = req.body;
        const userName = fullName || name;
        if (!userName || !email || !phoneNumber || !password || !role) {
            return failure(res, 400, "All fields are required");
        }
        if (await User.exists({ email })) return failure(res, 400, "User already exists");

        await User.create({
            fullName: userName,
            email,
            phoneNumber,
            password: await bcrypt.hash(password, 10),
            role,
        });
        return success(res, 201, "User registered successfully");
    } catch (error) {
        return handleError(res, error);
    }
}

export async function loginUser(req, res) {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return failure(res, 400, "Email, password, and role are required");
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return failure(res, 400, "Invalid email or password");
        }
        if (role !== user.role) return failure(res, 400, "Account does not exist for this role");

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
        return res.cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
        }).json({
            message: `Welcome back, ${user.fullName}`,
            user: publicUser(user),
            success: true,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export function logoutUser(req, res) {
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
    return success(res, 200, "Logged out successfully");
}

export async function getProfile(req, res) {
    try {
        const user = await User.findById(req.id).select("-password");
        if (!user) return failure(res, 404, "User not found");
        return success(res, 200, "Profile retrieved successfully", { user: publicUser(user) });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function updateProfile(req, res) {
    try {
        const {
            fullName,
            name,
            email,
            phoneNumber,
            bio,
            skills,
            preferredJob,
            education,
            experience,
            activelySeeking,
            resume,
            resumeOriginalName,
        } = req.body;
        const userName = fullName || name;

        const user = await User.findById(req.id);
        if (!user) return failure(res, 404, "User not found");

        if (userName) user.fullName = userName;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        user.profile = user.profile || {};
        if (bio !== undefined) user.profile.bio = bio;
        if (skills !== undefined) {
            user.profile.skills = Array.isArray(skills)
                ? skills
                : skills.split(",").map((skill) => skill.trim()).filter(Boolean);
        }
        if (preferredJob !== undefined) {
            user.profile.preferredJob = { ...user.profile.preferredJob, ...preferredJob };
        }
        if (education !== undefined && Array.isArray(education)) {
            user.profile.education = education;
        }
        if (experience !== undefined && Array.isArray(experience)) {
            user.profile.experience = experience;
        }
        if (resume !== undefined) user.profile.resume = resume;
        if (resumeOriginalName !== undefined) user.profile.resumeOriginalName = resumeOriginalName;

        if (activelySeeking !== undefined) {
            user.profile.activelySeeking = Boolean(activelySeeking);
            user.profile.activelySeekingExpiresAt = activelySeeking
                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                : null;
        }

        await user.save();
        return success(res, 200, "Profile updated successfully", { user: publicUser(user) });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function toggleActivelySeeking(req, res) {
    try {
        const { active } = req.body;
        const user = await User.findById(req.id);
        if (!user) return failure(res, 404, "User not found");

        user.profile = user.profile || {};
        user.profile.activelySeeking = Boolean(active);
        user.profile.activelySeekingExpiresAt = active
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : null;

        await user.save();
        return success(res, 200, active ? "Actively Seeking enabled for 7 days" : "Actively Seeking disabled", {
            user: publicUser(user),
            activelySeeking: user.profile.activelySeeking,
            expiresAt: user.profile.activelySeekingExpiresAt,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function toggleSaveJob(req, res) {
    try {
        const { jobId } = req.params;
        if (!jobId) return failure(res, 400, "Job ID is required");

        const user = await User.findById(req.id);
        if (!user) return failure(res, 404, "User not found");

        user.profile = user.profile || {};
        user.profile.savedJobs = user.profile.savedJobs || [];

        const existingIndex = user.profile.savedJobs.findIndex(
            (id) => id.toString() === jobId.toString()
        );

        let saved = false;
        if (existingIndex > -1) {
            user.profile.savedJobs.splice(existingIndex, 1);
            saved = false;
        } else {
            user.profile.savedJobs.push(jobId);
            saved = true;
        }

        await user.save();
        return success(res, 200, saved ? "Job saved successfully" : "Job removed from saved", {
            saved,
            savedJobs: user.profile.savedJobs,
            user: publicUser(user),
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function updatePreferences(req, res) {
    try {
        const { preferredJob } = req.body;
        const user = await User.findById(req.id);
        if (!user) return failure(res, 404, "User not found");

        user.profile = user.profile || {};
        user.profile.preferredJob = {
            category: preferredJob?.category || "",
            location: preferredJob?.location || "",
            expectedSalary: preferredJob?.expectedSalary || "",
            jobLevel: preferredJob?.jobLevel || "",
            jobType: preferredJob?.jobType || "",
        };

        await user.save();
        return success(res, 200, "Job preferences updated successfully", {
            preferredJob: user.profile.preferredJob,
            user: publicUser(user),
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function addJobAlert(req, res) {
    try {
        const { category, keyword, frequency } = req.body;
        const user = await User.findById(req.id);
        if (!user) return failure(res, 404, "User not found");

        user.profile = user.profile || {};
        user.profile.jobAlerts = user.profile.jobAlerts || [];
        user.profile.jobAlerts.push({
            category: category || "",
            keyword: keyword || "",
            frequency: frequency || "daily",
            createdAt: new Date(),
        });

        await user.save();
        return success(res, 201, "Job alert created successfully", {
            jobAlerts: user.profile.jobAlerts,
            user: publicUser(user),
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function deleteJobAlert(req, res) {
    try {
        const { alertId } = req.params;
        const user = await User.findById(req.id);
        if (!user) return failure(res, 404, "User not found");

        user.profile = user.profile || {};
        user.profile.jobAlerts = (user.profile.jobAlerts || []).filter(
            (alert) => alert._id && alert._id.toString() !== alertId.toString()
        );

        await user.save();
        return success(res, 200, "Job alert removed", {
            jobAlerts: user.profile.jobAlerts,
            user: publicUser(user),
        });
    } catch (error) {
        return handleError(res, error);
    }
}
