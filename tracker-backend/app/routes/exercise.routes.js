import express from "express";
import * as exercises from "../controllers/exercise.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// Exercise list route (for dropdown)
router.get("/list", authenticate, exercises.getAllExercises);

// Athlete-specific routes
router.get("/athlete/:athleteId", authenticate, exercises.findByAthlete);
router.get("/athlete/:athleteId/statistics", authenticate, exercises.getStatistics);

// CRUD routes for exercise results
router.post("/", authenticate, exercises.create);
router.get("/", authenticate, exercises.findAll);
router.get("/:id", authenticate, exercises.findOne);
router.put("/:id", authenticate, exercises.update);
router.delete("/:id", authenticate, exercises.remove);

export default router;