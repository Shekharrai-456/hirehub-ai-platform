import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Company } from "../src/models/company.model.js";
import { failure, handleError, success } from "../src/utils/http.js";

function publicCompany(company) {
    return {
        _id: company._id,
        companyName: company.companyName,
        email: company.email,
        phoneNumber: company.phoneNumber,
        location: company.location || "",
        website: company.website || "",
        industry: company.industry || "",
        size: company.size || "",
        logo: company.logo || "",
        description: company.description || "",
    };
}

export async function registerCompany(req, res) {
    try {
        const { companyName, email, phoneNumber, password } = req.body;
        if (!companyName || !email || !phoneNumber || !password) {
            return failure(res, 400, "All fields are required");
        }
        if (await Company.exists({ email })) return failure(res, 400, "Company already exists");

        await Company.create({
            companyName,
            email,
            phoneNumber,
            password: await bcrypt.hash(password, 10),
        });
        return success(res, 201, "Company registered successfully");
    } catch (error) {
        return handleError(res, error);
    }
}

export async function loginCompany(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return failure(res, 400, "Email and password are required");

        const company = await Company.findOne({ email });
        if (!company || !(await bcrypt.compare(password, company.password))) {
            return failure(res, 400, "Invalid email or password");
        }

        const token = jwt.sign({ companyId: company._id }, process.env.SECRET_KEY, { expiresIn: "1h" });
        return res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        }).json({
            message: "Company logged in successfully",
            company: publicCompany(company),
            success: true,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export function logoutCompany(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return success(res, 200, "Company logged out successfully");
}

export async function getCompanyById(req, res) {
    try {
        const targetId = req.params.id || req.companyId;
        const company = await Company.findById(targetId);
        if (!company) return failure(res, 404, "Company not found");
        return success(res, 200, "Company fetched successfully", { company: publicCompany(company) });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function updateCompanyProfile(req, res) {
    try {
        const targetId = req.params.id || req.companyId || req.body.companyId || req.body._id;
        if (!targetId) {
            return failure(res, 400, "Company ID is required");
        }
        const { companyName, email, phoneNumber, location, website, industry, size, description } = req.body;
        const updateData = {};
        if (companyName) updateData.companyName = companyName;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;
        if (industry !== undefined) updateData.industry = industry;
        if (size !== undefined) updateData.size = size;
        if (description !== undefined) updateData.description = description;

        const company = await Company.findByIdAndUpdate(
            targetId,
            updateData,
            { new: true, runValidators: true },
        );
        if (!company) return failure(res, 404, "Company not found");
        return success(res, 200, "Company profile updated successfully", { company: publicCompany(company) });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function uploadCompanyLogo(req, res) {
    try {
        if (!req.file) {
            return failure(res, 400, "No logo file uploaded");
        }
        const targetId = req.params.id || req.companyId || req.body.companyId;
        if (!targetId) {
            return failure(res, 400, "Company ID is required");
        }

        const logoUrl = `/uploads/logos/${req.file.filename}`;
        const company = await Company.findByIdAndUpdate(
            targetId,
            { logo: logoUrl },
            { new: true }
        );
        if (!company) return failure(res, 404, "Company not found");

        return success(res, 200, "Company logo uploaded successfully", {
            company: publicCompany(company),
            logo: logoUrl,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getAllCompanies(req, res) {
    try {
        const companies = await Company.find().select("-password").sort({ createdAt: -1 });
        return success(res, 200, "Companies fetched successfully", {
            companies: companies.map(publicCompany),
        });
    } catch (error) {
        return handleError(res, error);
    }
}


