import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    requirements: {
        type: [String],
        required: true,
    },


    salary: {
        type: Number,
        required: true,
    },

    location: {
        type: String,
        required: true, 
    },


    jobType: {
        type: String,
        enum: ["full-time", "part-time", "contract", "internship"],     
    required: true,
    },

    position: {
        type: String,
        required: true,
    },

    experience: {
        type: String,
        required: true,
    },

    skills: {       
        type: [String],
    },


    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },  
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
    }], 
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);