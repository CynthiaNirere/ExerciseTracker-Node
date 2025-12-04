import express from "express";
import * as coachController from "../controllers/coach.controller.js"; // ← CHANGED THIS
import authenticate from "../authorization/authorization.js";

const router = express.Router();


router.use(authenticate);


router.get("/:coachId/profile", coachController.getCoachProfile);


router.get("/:coachId/athletes", coachController.getAthletes);

 
router.get("/athlete/:athleteId", coachController.getAthleteById);


router.post("/athletes", coachController.createAthlete);


router.post("/athletes/assign", coachController.assignAthlete);

export default router;