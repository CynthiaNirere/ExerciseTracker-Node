import { Router } from "express";
import CoachController from "../controllers/coach.controller.js";

const router = Router();

router.get("/coach/athletes", CoachController.getAthletes);
router.post("/coach/athletes/assign", CoachController.assignAthlete);

export default router;