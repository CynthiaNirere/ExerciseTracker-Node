import express from "express";
import * as exercisePlans from "../controllers/exercisePlan.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// Re-enable authentication
router.post("/", authenticate, exercisePlans.create);
router.get("/", authenticate, exercisePlans.findAll);
router.get("/difficulty/:difficulty", authenticate, exercisePlans.findByDifficulty);
router.get("/:id", authenticate, exercisePlans.findOne);
router.put("/:id", authenticate, exercisePlans.update);
router.delete("/:id", authenticate, exercisePlans.remove);

export default router;