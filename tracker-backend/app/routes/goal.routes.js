import GoalController from "../controllers/goal.controller.js";
import { Router } from "express";

var router = Router();

// Create a new goal
router.post("/goals", GoalController.createGoal);

// Get all goals for an athlete
router.get("/athletes/:athleteId/goals", GoalController.getAthleteGoals);

// Update a goal
router.put("/goals/:id", GoalController.updateGoal);

// Delete a goal
router.delete("/goals/:id", GoalController.deleteGoal);

export default router;