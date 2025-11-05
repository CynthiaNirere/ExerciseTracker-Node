import express from "express";
import * as exercises from "../controllers/exercise.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// ========================================
// EXERCISE MANAGEMENT (Admin)
// ========================================

// Exercise list route (for dropdown/viewing all exercises)
router.get("/list", authenticate, exercises.getAllExercises);

// Get single exercise by ID
router.get("/exercise/:id", authenticate, exercises.getExerciseById);

// Admin CRUD for exercises (create/update/delete actual exercises)
router.post("/manage", authenticate, exercises.createExercise);
router.put("/manage/:id", authenticate, exercises.updateExercise);
router.delete("/manage/:id", authenticate, exercises.deleteExercise);

// ========================================
// ATHLETE EXERCISE RESULTS
// ========================================

// Athlete-specific routes
router.get("/athlete/:athleteId", authenticate, exercises.findByAthlete);
router.get("/athlete/:athleteId/statistics", authenticate, exercises.getStatistics);

// CRUD routes for exercise results (logged workouts)
router.post("/", authenticate, exercises.create);
router.get("/", authenticate, exercises.findAll);
router.get("/:id", authenticate, exercises.findOne);
router.put("/:id", authenticate, exercises.update);
router.delete("/:id", authenticate, exercises.remove);

export default router;