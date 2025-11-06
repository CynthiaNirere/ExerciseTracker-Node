import express from "express";
import * as coachController from "../controllers/coach.controller.js"; // ← CHANGED THIS
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// All coach routes require authentication
router.use(authenticate);

// Get coach profile
router.get("/:coachId/profile", coachController.getCoachProfile);

// Get coach's athletes
router.get("/:coachId/athletes", coachController.getAthletes);

// Get specific athlete details  
router.get("/athlete/:athleteId", coachController.getAthleteById);

// Create new athlete
router.post("/athletes", coachController.createAthlete);

// Assign athlete to coach
router.post("/athletes/assign", coachController.assignAthlete);

export default router;