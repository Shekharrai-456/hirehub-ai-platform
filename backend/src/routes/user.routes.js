import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    registerUser as register,
    loginUser as login,
    logoutUser as logout,
    updateProfile,
} from "../../controllers/user.controllers.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile/update").post(isAuthenticated, updateProfile);

export default router;