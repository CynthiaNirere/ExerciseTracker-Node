import { Router } from "express";
import PlanController from "../controllers/plan.controller.js";

const router = Router();

router.get("/plans", PlanController.getAll);
router.post("/plans", PlanController.create);
router.delete("/plans/:id", PlanController.delete);

export default router;