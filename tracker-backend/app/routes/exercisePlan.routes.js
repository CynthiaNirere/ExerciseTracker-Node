import express from "express";
import * as exercisePlans from "../controllers/exercisePlan.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// CRUD routes
router.post("/", authenticate, exercisePlans.create);
router.get("/", authenticate, exercisePlans.findAll);
router.get("/:id", authenticate, exercisePlans.findOne);
router.put("/:id", authenticate, exercisePlans.update);
router.delete("/:id", authenticate, exercisePlans.remove);

// Find plans by difficulty
router.get("/difficulty/:difficulty", authenticate, exercisePlans.findByDifficulty);

export default router;
