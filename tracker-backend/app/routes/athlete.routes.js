import athletes from "../controllers/athlete.controller.js";
import authenticate from "../authorization/authorization.js";
import { Router } from "express";

const router = Router();

// Register new athlete (public route)
router.post("/register", athletes.register);

// Get athlete dashboard data
router.get("/dashboard", [authenticate], athletes.getDashboard);

// Get athlete's assigned workouts
router.get("/workouts", [authenticate], athletes.getWorkouts);

// Log workout completion
router.post(
  "/workouts/:assignmentId/complete",
  [authenticate],
  athletes.completeWorkout
);

// Get athlete's workout history
router.get("/history", [authenticate], athletes.getHistory);

// Get athlete profile
router.get("/profile", [authenticate], athletes.getProfile);

// Update athlete profile
router.put("/profile", [authenticate], athletes.updateProfile);

export default router;
import express from "express";
import * as athlete from "../controllers/athlete.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// Athlete Profile Routes
router.get("/profile", authenticate, athlete.getProfile);
router.put("/profile", authenticate, athlete.updateProfile);

// Athlete Goals Routes
router.get("/goals", authenticate, athlete.getGoals);
router.post("/goals", authenticate, athlete.createGoal);
router.put("/goals/:id", authenticate, athlete.updateGoal);
router.delete("/goals/:id", authenticate, athlete.deleteGoal);

// Exercise Results Routes
router.get("/results", authenticate, athlete.getExerciseResults);
router.post("/results", authenticate, athlete.recordExerciseResult);

// Statistics Routes
router.get("/statistics", authenticate, athlete.getStatistics);
router.get("/progress", authenticate, athlete.getProgress);

export default router;