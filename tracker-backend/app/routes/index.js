import { Router } from "express";

import AuthRoutes from "./auth.routes.js";
import UserRoutes from "./user.routes.js";
import ExerciseRoutes from "./exercise.routes.js";



const router = Router();

router.use("/", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/exercises", ExerciseRoutes);


export default router;
