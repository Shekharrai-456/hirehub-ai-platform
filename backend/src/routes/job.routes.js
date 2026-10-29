import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    postJob, getAllJobs, getJobById, updateJob, deleteJob,
    getJobsByCompanyId,
    getAdminJobs
} from "../../controllers/job.controllers.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, postJob);
router.route("/company/:companyId").get(getJobsByCompanyId);
router.route("/admin").get(getAdminJobs);
router.route("/all").get(getAllJobs);
router.route("/:id").get(getJobById);
router.route("/:id").put(isAuthenticated, updateJob);
router.route("/:id").delete(isAuthenticated, deleteJob);

export default router;