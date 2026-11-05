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
        bio: {type: String, default: ""},
        skills: [{type: String}],
        resume: {type: String, default: ""}, // URL or path to the resume file
        resumeOriginalName: {type: String, default: ""}, // Original name of the uploaded resume file
        company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'}, // For recruiters
        profilePicture: {type: String, default: ""}, // URL or path to the profile picture
        activelySeeking: {type: Boolean, default: false},
        activelySeekingExpiresAt: {type: Date},
        preferredJob: {
            category: {type: String, default: ""},
            location: {type: String, default: ""},
            expectedSalary: {type: String, default: ""},
            jobLevel: {type: String, default: ""},
            jobType: {type: String, default: ""}
        },
        savedJobs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Job'}],
        jobAlerts: [{
            category: {type: String},
            keyword: {type: String},
            frequency: {type: String, default: "daily"},
            createdAt: {type: Date, default: Date.now}
        }],
        education: [{
            degree: {type: String},
            institution: {type: String},
            graduationYear: {type: String}
        }],
        experience: [{
            title: {type: String},
            company: {type: String},
            duration: {type: String}
        }],
        profileViews: {type: Number, default: 0},
    },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);