import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { upload } from "../middlewares/upload.js";
import {
    registerCompany,
    loginCompany,
    logoutCompany,
    updateCompanyProfile,
    getCompanyById,
    getAllCompanies,
    uploadCompanyLogo,
} from "../../controllers/company.controllers.js";

const router = express.Router();

router.route("/all").get(getAllCompanies);
router.route("/register").post(registerCompany);
router.route("/login").post(loginCompany);
router.route("/logout").post(logoutCompany);
router.route("/profile/update").post(isAuthenticated, updateCompanyProfile);
router.route("/profile/update/:id").post(isAuthenticated, updateCompanyProfile);
router.route("/profile/logo").post(isAuthenticated, upload.single("logo"), uploadCompanyLogo);
router.route("/profile/logo/:id").post(isAuthenticated, upload.single("logo"), uploadCompanyLogo);
router.route("/:id").get(getCompanyById);

export default router;

