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
        const { fullName, name, email, phoneNumber, bio = "", skills = "" } = req.body;
        const userName = fullName || name;
        if (!userName || !email || !phoneNumber) {
            return failure(res, 400, "Full name, email, and phone number are required");
        }

        const user = await User.findById(req.id);
        if (!user) return failure(res, 404, "User not found");

        user.fullName = userName;
        user.email = email;
        user.phoneNumber = phoneNumber;
        user.profile = user.profile || {};
        user.profile.bio = bio;
        user.profile.skills = Array.isArray(skills)
            ? skills
            : skills.split(",").map((skill) => skill.trim()).filter(Boolean);
        await user.save();

        return success(res, 200, "Profile updated successfully", { user: publicUser(user) });
    } catch (error) {
        return handleError(res, error);
    }
}
