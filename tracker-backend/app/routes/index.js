import { Router } from "express";

import AuthRoutes from "./auth.routes.js";
import UserRoutes from "./user.routes.js";
// import TutorialRoutes from "./tutorial.routes.js";  // ← Comment out
// import LessonRoutes from "./lesson.routes.js";      // ← Comment out
import CoachRoutes from "./coach.routes.js"; 
import ExerciseRoutes from "./exercise.routes.js";
import PlanRoutes from "./plan.routes.js";

const router = Router();

router.use("/", AuthRoutes);
router.use("/users", UserRoutes);
// router.use("/tutorials", TutorialRoutes);  // ← Comment out
// router.use("/tutorials", LessonRoutes);    // ← Comment out
router.use("/api", CoachRoutes); 
router.use("/api", ExerciseRoutes);
router.use("/api", PlanRoutes);

export default router;