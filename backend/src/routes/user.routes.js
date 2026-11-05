import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    registerUser as register,
    loginUser as login,
    logoutUser as logout,
    getProfile,
    updateProfile,
    toggleActivelySeeking,
    toggleSaveJob,
    updatePreferences,
    addJobAlert,
    deleteJobAlert,
} from "../../controllers/user.controllers.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile").get(isAuthenticated, getProfile);
router.route("/profile/update").post(isAuthenticated, updateProfile);
router.route("/profile/toggle-seeking").post(isAuthenticated, toggleActivelySeeking);
router.route("/profile/save-job/:jobId").post(isAuthenticated, toggleSaveJob);
router.route("/profile/preferences").post(isAuthenticated, updatePreferences);
router.route("/profile/job-alerts").post(isAuthenticated, addJobAlert);
router.route("/profile/job-alerts/:alertId").delete(isAuthenticated, deleteJobAlert);

export default router;