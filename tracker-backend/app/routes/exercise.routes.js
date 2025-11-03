import { Router } from "express";
import ExerciseController from "../controllers/exercise.controller.js";

const router = Router();

router.get("/exercises", ExerciseController.getAll);
router.post("/exercises", ExerciseController.create);
router.delete("/exercises/:id", ExerciseController.delete);

export default router;