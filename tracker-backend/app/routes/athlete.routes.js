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