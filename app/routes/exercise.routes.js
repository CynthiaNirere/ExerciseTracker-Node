import express from "express";
import * as exercises from "../controllers/exercise.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();


router.get("/list", authenticate, exercises.getAllExercises);


router.get("/exercise/:id", authenticate, exercises.getExerciseById);


router.post("/manage", authenticate, exercises.createExercise);
router.put("/manage/:id", authenticate, exercises.updateExercise);
router.delete("/manage/:id", authenticate, exercises.deleteExercise);


router.get("/athlete/:athleteId", authenticate, exercises.findByAthlete);
router.get("/athlete/:athleteId/statistics", authenticate, exercises.getStatistics);


router.post("/", authenticate, exercises.create);
router.get("/", authenticate, exercises.findAll);
router.get("/:id", authenticate, exercises.findOne);
router.put("/:id", authenticate, exercises.update);
router.delete("/:id", authenticate, exercises.remove);

export default router;