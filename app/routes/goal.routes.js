import express from "express";
import * as goals from "../controllers/goal.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

router.get("/athlete/:athleteId", authenticate, goals.getGoalsByAthlete);
router.post("/", authenticate, goals.createGoal);
router.get("/:id", authenticate, goals.getGoalById);
router.put("/:id", authenticate, goals.updateGoal);
router.delete("/:id", authenticate, goals.deleteGoal);
router.get("/", authenticate, goals.getAllGoals);

export default router;