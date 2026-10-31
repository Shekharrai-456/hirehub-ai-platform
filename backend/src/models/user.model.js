import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user","recruiter", "admin"],
        default: "user",
        required: true,
    },
    profile:{
        bio: {type: String},
        skills: [{type: String}],
        resume: {type: String}, // URL or path to the resume file
        resumeOriginalName: {type: String}, // Original name of the uploaded resume file
        company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'}, // For recruiters
        profilePicture: {type: String, default: ""}, // URL or path to the profile picture
    },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);