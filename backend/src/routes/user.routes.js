import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { upload } from "../middlewares/upload.js";
import {
    registerUser as register,
    loginUser as login,
    logoutUser as logout,
    getProfile,
    updateProfile,
    uploadResume,
    toggleBookmarkJob,
    getSavedJobs,
} from "../../controllers/user.controllers.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile").get(isAuthenticated, getProfile);
router.route("/profile/update").post(isAuthenticated, updateProfile);
router.route("/profile/resume").post(isAuthenticated, upload.single("resume"), uploadResume);
router.route("/bookmark/:jobId").post(isAuthenticated, toggleBookmarkJob);
router.route("/saved-jobs").get(isAuthenticated, getSavedJobs);

export default router;