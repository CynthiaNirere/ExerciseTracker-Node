import { Router } from "express";

import AuthRoutes from "./auth.routes.js";
import UserRoutes from "./user.routes.js";
import CoachRoutes from "./coach.routes.js"; 
import ExerciseRoutes from "./exercise.routes.js";
import PlanRoutes from "./plan.routes.js";
import AthleteRoutes from "./athlete.routes.js";
import GoalRoutes from "./goal.routes.js";  // ADD THIS

const router = Router();

router.use("/", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/api", CoachRoutes); 
router.use("/api", ExerciseRoutes);
router.use("/api", PlanRoutes);
router.use("/api", AthleteRoutes);
router.use("/api", GoalRoutes);  // ADD THIS

export default router;