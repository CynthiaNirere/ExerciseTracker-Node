import express from "express";
import * as exercisePlans from "../controllers/exercisePlan.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();


router.post("/", authenticate, exercisePlans.create);
router.get("/", authenticate, exercisePlans.findAll);
router.get("/difficulty/:difficulty", authenticate, exercisePlans.findByDifficulty);
router.get("/:id", authenticate, exercisePlans.findOne);
router.put("/:id", authenticate, exercisePlans.update);
router.delete("/:id", authenticate, exercisePlans.remove);


router.post("/:planId/assign", authenticate, exercisePlans.assignPlanToAthlete);
router.get("/athlete/:athleteId", authenticate, exercisePlans.getAssignedPlans);
router.delete("/:planId/assign/:athleteId", authenticate, exercisePlans.unassignPlanFromAthlete);

export default router;