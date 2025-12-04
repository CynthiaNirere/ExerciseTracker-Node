import express from "express";
import * as exercisePlans from "../controllers/exercisePlan.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// Existing routes
router.post("/", authenticate, exercisePlans.create);
router.get("/", authenticate, exercisePlans.findAll);

// NEW: Get plans by coach (must be before /:id to avoid route conflict)
router.get("/coach/:coachId", authenticate, exercisePlans.findByCoach);

// NEW: Get plans assigned to specific athlete (must be before /:id)
router.get("/athlete/:athleteId", authenticate, exercisePlans.getAssignedPlans);

// Get single plan by ID
router.get("/:id", authenticate, exercisePlans.findOne);

// Update and delete
router.put("/:id", authenticate, exercisePlans.update);
router.delete("/:id", authenticate, exercisePlans.remove);

// NEW: Plan Assignment Routes
router.post("/:planId/assign", authenticate, exercisePlans.assignPlanToAthlete);
router.delete("/:planId/assign/:athleteId", authenticate, exercisePlans.unassignPlanFromAthlete);

export default router;