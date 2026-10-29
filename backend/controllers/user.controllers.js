import bcrypt from "bcryptjs";
import { User } from "../src/models/user.model.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { fullName, name, email, phoneNumber, password, role } = req.body;
        const userFullName = fullName || name;
        if (!userFullName || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ 
            message: "All fields are required",
            success: false
            });
        };

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ 
                message: "User already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullName: userFullName,
            email,  
            phoneNumber,
            password: hashedPassword,
            role,
        });

        return res.status(201).json({
            message: "User registered successfully",
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



export const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ 
                message: "Email, password, and role are required",
                success: false
            });
        }

        let user = await User.findOne({ email});
        if (!user) {
            return res.status(400).json({ 
                message: "Invalid email or password",
                success: false
            });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ 
                message: "Invalid email or password",
                success: false
            });
        }

        //check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({ 
                message: "Account does not exist for this role",
                success: false
            });
        }

        const tokenData = {
            userId: user._id,
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

        user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile : user.profile,
        }

        return res.status(200).cookie("token", token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict'}).json({
            message: `Welcome back, ${user.fullName}`,
            user,
            success: true,
            token,
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }           
}



export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: 'strict' });       

        return res.status(200).json({
            message: "Logged out successfully",
            success: true
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }   

}



export const updateProfile = async (req, res) => {
    try {
        const { fullName, name, email, phoneNumber, bio, skills = "" } = req.body;
        const userFullName = fullName || name;
        const file = req.file; // Assuming you're using multer for file uploads
        if (!userFullName || !email || !phoneNumber) {
            return res.status(400).json({ 
                message: "Full name, email, and phone number are required",
                success: false
            });
        }

        // cloudinary image upload




        const skillsArray = skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
        const userId = req.id; // middleware authentication 
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                success: false
            });
        }

        // Update user profile
        user.fullName = userFullName;
        user.email = email;
        user.phoneNumber = phoneNumber;
        user.profile = user.profile || {};
        user.profile.bio = bio || "";
        user.profile.skills = skillsArray;

        // resume 

        await user.save();

        user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile : user.profile,
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
