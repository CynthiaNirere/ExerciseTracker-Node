import express from "express";
import * as exercises from "../controllers/exercise.controller.js";
import authenticate from "../authorization/authorization.js";

const router = express.Router();

// CRUD routes
router.post("/", authenticate, exercises.create);
router.get("/", authenticate, exercises.findAll);
router.get("/:id", authenticate, exercises.findOne);
router.put("/:id", authenticate, exercises.update);
router.delete("/:id", authenticate, exercises.remove);

// Optional: find by category
router.get("/category/:category", authenticate, exercises.findByCategory);

export default router;
