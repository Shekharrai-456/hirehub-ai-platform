import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    registerCompany,
    loginCompany,
    logoutCompany,
    updateCompanyProfile,
    getCompanyById,
    getAllCompanies,
} from "../../controllers/company.controllers.js";

const router = express.Router();

router.route("/all").get(getAllCompanies);
router.route("/register").post(registerCompany);
router.route("/login").post(loginCompany);
router.route("/logout").post(logoutCompany);
router.route("/profile/update").post(isAuthenticated, updateCompanyProfile);
router.route("/profile/update/:id").post(isAuthenticated, updateCompanyProfile);
router.route("/:id").get(getCompanyById);

export default router;
