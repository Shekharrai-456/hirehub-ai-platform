import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    companyName: {
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

    description: {
        type: String,
        
    },

    location: {
        type: String,
    },

    website: {
        type: String,
    },

    industry: {
        type: String,
    },

    size: {
        type: String,
    },  

    logo: {
        type: String,
        default: "", // URL or path to the logo file
    },

    password: {
        type: String,
        required: true,
    },

}, { timestamps: true });  

export const Company = mongoose.model("Company", companySchema);

