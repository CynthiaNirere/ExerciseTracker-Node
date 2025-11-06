import express from 'express';
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import athleteRoutes from "./athlete.routes.js";
import exerciseRoutes from "./exercise.routes.js";
import exercisePlanRoutes from "./exercisePlan.routes.js";
import goalRoutes from "./goal.routes.js";
import coachRoutes from "./coach.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/athletes", athleteRoutes);
router.use("/exercises", exerciseRoutes);
router.use("/exercise-plans", exercisePlanRoutes);
router.use("/goals", goalRoutes);
router.use("/coach", coachRoutes);

export default router;