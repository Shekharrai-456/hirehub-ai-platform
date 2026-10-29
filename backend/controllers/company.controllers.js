import { Company } from "../src/models/company.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const registerCompany = async (req, res) => {
    try {
        const { companyName, email, phoneNumber, password } = req.body;

        if (!companyName || !email || !phoneNumber || !password) {
            return res.status(400).json({ 
                message: "All fields are required",
                success: false
            });
        }

        const company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "Company already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Company.create({
            companyName,
            email,
            phoneNumber,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "Company registered successfully",
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

export const loginCompany = async (req, res) => {
    try {
        const { email, password } = req.body;   

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false
            });
        }

        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(400).json({
                message: "Company not found",
                success: false
            });
        }

        const isPasswordValid = await bcrypt.compare(password, company.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid password",
                success: false
            });
        }

        const token = jwt.sign({ companyId: company._id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000, // 1 hour
        });

        return res.status(200).json({
            message: "Company logged in successfully",
            success: true,
            company: {
                _id: company._id,
                companyName: company.companyName,
                email: company.email,
                phoneNumber: company.phoneNumber,
            },
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};


export const logoutCompany = async (req, res) => {
    try {
        res.clearCookie("token", {  

            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            message: "Company logged out successfully",
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


// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.companyId || req.params.id;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company fetched successfully",
            success: true,
            company,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};


export const updateCompanyProfile = async (req, res) => {
    try {
        const companyId = req.params.id;
        const { companyName, email, phoneNumber } = req.body;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        company.companyName = companyName || company.companyName;
        company.email = email || company.email;
        company.phoneNumber = phoneNumber || company.phoneNumber;

        await company.save();

        return res.status(200).json({
            message: "Company profile updated successfully",
            success: true,
            company,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

};