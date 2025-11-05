import AthleteController from "../controllers/athlete.controller.js";
import { Router } from "express";

const router = Router();

// Create new athlete (POST route - must come BEFORE the GET routes with :id param)
router.post("/athletes", AthleteController.createAthlete);

// Get all athletes for a coach
router.get("/coach/:coachId/athletes", AthleteController.getCoachAthletes);

// Get specific athlete by ID
router.get("/athletes/:id", AthleteController.getAthleteById);

// Get athlete's goals
//router.get("/athletes/:id/goals", AthleteController.getAthleteGoals);

// Get athlete's workout results
router.get("/athletes/:id/results", AthleteController.getAthleteResults);

export default router;