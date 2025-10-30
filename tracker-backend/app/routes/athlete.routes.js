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