import express from "express";
import * as goals from "../controllers/goal.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// Get daily/weekly goals for athlete
router.get("/athlete/:athleteId/daily", authenticate, goals.getDailyGoals);

// Get exercises from a specific plan (for goal creation)
router.get("/plan/:planId/exercises", authenticate, goals.getExercisesFromPlan);

// Get goals by athlete
router.get("/athlete/:athleteId", authenticate, goals.getGoalsByAthlete);

// CRUD operations
router.post("/", authenticate, goals.createGoal);
router.get("/:id", authenticate, goals.getGoalById);
router.put("/:id", authenticate, goals.updateGoal);
router.delete("/:id", authenticate, goals.deleteGoal);
router.get("/", authenticate, goals.getAllGoals);

export default router;