import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = Router();

// All task routes require a valid JWT
router.use(authMiddleware);

// POST   /api/tasks
router.post("/", createTask);

// GET    /api/tasks
router.get("/", getAllTasks);

// GET    /api/tasks/:id
router.get("/:id", getTaskById);

// PATCH  /api/tasks/:id
router.patch("/:id", updateTask);
router.put("/:id", updateTask);

// DELETE /api/tasks/:id
router.delete("/:id", deleteTask);

export default router;