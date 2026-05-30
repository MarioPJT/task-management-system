import {
  createTask   as createTaskRepo,
  getAllTasks   as getAllTasksRepo,
  getTaskById  as getTaskByIdRepo,
  updateTask   as updateTaskRepo,
  deleteTask   as deleteTaskRepo,
} from "../repositories/task.repository.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const notFound = (id) => {
  const err = new Error(`Task with id "${id}" not found`);
  err.status = 404;
  return err;
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Creates a new task.
 *
 * @param {{ title: string, description?: string, status?: string, priority?: string, dueDate?: string, createdBy: string, assignedTo?: string }} data
 * @returns {Promise<object>} Created task
 */
export const createTask = async (data) => {
  if (!data.title?.trim()) {
    const err = new Error("Title is required");
    err.status = 400;
    throw err;
  }

  if (!data.createdBy) {
    const err = new Error("Creator ID is required");
    err.status = 400;
    throw err;
  }

  return createTaskRepo(data);
};

/**
 * Retrieves all tasks with optional filters.
 *
 * @param {{ status?: string, priority?: string, assignedTo?: string }} filters
 * @returns {Promise<object[]>} List of tasks
 */
export const getAllTasks = async (filters = {}) => {
  return getAllTasksRepo(filters);
};

/**
 * Retrieves a single task by ID.
 *
 * @param {string} id - Task UUID
 * @returns {Promise<object>} Task
 * @throws {404} If task does not exist
 */
export const getTaskById = async (id) => {
  const task = await getTaskByIdRepo(id);
  if (!task) throw notFound(id);
  return task;
};

/**
 * Updates an existing task.
 *
 * @param {string} id     - Task UUID
 * @param {object} fields - Fields to update
 * @returns {Promise<object>} Updated task
 * @throws {404} If task does not exist
 * @throws {400} If no valid fields are provided
 */
export const updateTask = async (id, fields) => {
  const allowed = ["title", "description", "status", "priority", "dueDate", "assignedTo"];
  const hasFields = allowed.some((key) => fields[key] !== undefined);

  if (!hasFields) {
    const err = new Error("No valid fields provided for update");
    err.status = 400;
    throw err;
  }

  const existing = await getTaskByIdRepo(id);
  if (!existing) throw notFound(id);

  const updated = await updateTaskRepo(id, fields);
  return updated;
};

/**
 * Deletes a task by ID.
 *
 * @param {string} id - Task UUID
 * @returns {Promise<object>} Deleted task
 * @throws {404} If task does not exist
 */
export const deleteTask = async (id) => {
  const existing = await getTaskByIdRepo(id);
  if (!existing) throw notFound(id);

  return deleteTaskRepo(id);
};