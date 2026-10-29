import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { applyJob, getAppliedJobsForUser, getApplicantsForJob, updateApplicationStatus } from "../../controllers/application.controllers.js";

const router = express.Router();

router.route("/apply/:jobId").post(isAuthenticated, applyJob);
router.route("/user/:userId").get(isAuthenticated, getAppliedJobsForUser);
router.route("/job/:jobId").get(isAuthenticated, getApplicantsForJob);
router.route("/:applicationId/status").put(isAuthenticated, updateApplicationStatus);



export default router;
