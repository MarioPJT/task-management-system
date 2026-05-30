import {
  createTask   as createTaskService,
  getAllTasks   as getAllTasksService,
  getTaskById  as getTaskByIdService,
  updateTask   as updateTaskService,
  deleteTask   as deleteTaskService,
} from "../services/task.service.js";

/**
 * POST /api/tasks
 * Creates a new task.
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await createTaskService({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: req.user.id,
      assignedTo,
    });

    res.status(201).json({
      status:  "success",
      message: "Task created successfully",
      data:    task,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tasks
 * Retrieves all tasks with optional filters (?status=&priority=&assignedTo=).
 */
export const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;

    const tasks = await getAllTasksService({ status, priority, assignedTo });

    res.status(200).json({
      status:  "success",
      message: "Tasks retrieved successfully",
      total:   tasks.length,
      data:    tasks,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tasks/:id
 * Retrieves a single task by ID.
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await getTaskByIdService(req.params.id);

    res.status(200).json({
      status:  "success",
      message: "Task retrieved successfully",
      data:    task,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/tasks/:id
 * Partially updates an existing task.
 */
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await updateTaskService(req.params.id, {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
    });

    res.status(200).json({
      status:  "success",
      message: "Task updated successfully",
      data:    task,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/tasks/:id
 * Deletes a task by ID.
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await deleteTaskService(req.params.id);

    res.status(200).json({
      status:  "success",
      message: "Task deleted successfully",
      data:    task,
    });
  } catch (err) {
    next(err);
  }
};