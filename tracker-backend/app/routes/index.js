import { Router } from "express";

import AuthRoutes from "./auth.routes.js";
import UserRoutes from "./user.routes.js";
import ExerciseRoutes from "./exercise.routes.js";
import ExercisePlanRoutes from "./exercisePlan.routes.js";
import GoalRoutes from "./goal.routes.js";
import AthleteRoutes from "./athlete.routes.js"; 




const router = Router();

router.use("/", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/exercises", ExerciseRoutes);
router.use("/goals", GoalRoutes);
router.use("/athlete", AthleteRoutes);
router.use("/exercise-plans", ExercisePlanRoutes);

export default router;
