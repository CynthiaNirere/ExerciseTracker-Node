import coachAthletes from "../controllers/coachAthlete.controller.js";
import authenticate from "../authorization/authorization.js";
import { Router } from "express";

const router = Router();

// Get all athletes assigned to coach
router.get("/athletes", [authenticate], coachAthletes.getAllAthletes);

// Assign athlete to coach
router.post("/athletes/assign", [authenticate], coachAthletes.assignAthlete);

// Remove athlete assignment
router.delete(
  "/athletes/:athleteId",
  [authenticate],
  coachAthletes.removeAthlete
);

// Get specific athlete details
router.get(
  "/athletes/:athleteId",
  [authenticate],
  coachAthletes.getAthleteDetails
);

// Get athlete's workout progress
router.get(
  "/athletes/:athleteId/progress",
  [authenticate],
  coachAthletes.getAthleteProgress
);

// Assign workout to athlete
router.post("/workouts/assign", [authenticate], coachAthletes.assignWorkout);

export default router;