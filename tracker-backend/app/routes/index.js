import { Router } from "express";

import AuthRoutes from "./auth.routes.js";
import UserRoutes from "./user.routes.js";
import ExerciseRoutes from "./exercise.routes.js";
import ExercisePlanRoutes from "./exercisePlan.routes.js";

const router = Router();

router.use("/", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/exercises", ExerciseRoutes);
router.use("/plans", ExercisePlanRoutes);

export default router;
