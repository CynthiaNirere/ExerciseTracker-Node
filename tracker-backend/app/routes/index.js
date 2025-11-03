import { Router } from "express";

import AuthRoutes from "./auth.routes.js";
import UserRoutes from "./user.routes.js";
import CoachRoutes from "./coach.routes.js"; 
import ExerciseRoutes from "./exercise.routes.js";

const router = Router();

router.use("/", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/api", CoachRoutes); 
router.use("/api", ExerciseRoutes);  

export default router;