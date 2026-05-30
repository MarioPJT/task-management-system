import { query } from "../config/db.js";

/**
 * Creates a new task.
 *
 * @param {{ title: string, description?: string, status?: string, priority?: string, dueDate?: string, createdBy: string, assignedTo?: string }} data
 * @returns {Promise<object>} Created task row
 */
export const createTask = async ({
  title,
  description = null,
  status      = "PENDING",
  priority    = "MEDIUM",
  dueDate     = null,
  createdBy,
  assignedTo  = null,
}) => {
  const sql = `
    INSERT INTO tasks (title, description, status, priority, due_date, created_by, assigned_to)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await query(sql, [
    title, description, status, priority, dueDate, createdBy, assignedTo,
  ]);
  return rows[0];
};

/**
 * Retrieves all tasks with optional filters.
 *
 * @param {{ status?: string, priority?: string, assignedTo?: string }} filters
 * @returns {Promise<object[]>} Array of task rows
 */
export const getAllTasks = async (filters = {}) => {
  const conditions = [];
  const values     = [];
  let   index      = 1;

  if (filters.status) {
    conditions.push(`status = $${index++}`);
    values.push(filters.status);
  }

  if (filters.priority) {
    conditions.push(`priority = $${index++}`);
    values.push(filters.priority);
  }

  if (filters.assignedTo) {
    conditions.push(`assigned_to = $${index++}`);
    values.push(filters.assignedTo);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT *
    FROM tasks
    ${where}
    ORDER BY created_at DESC
  `;

  const { rows } = await query(sql, values);
  return rows;
};

/**
 * Finds a task by its UUID.
 *
 * @param {string} id - Task UUID
 * @returns {Promise<object|null>} Task row or null if not found
 */
export const getTaskById = async (id) => {
  const sql = `
    SELECT *
    FROM tasks
    WHERE task_number = $1
    LIMIT 1
  `;
  const { rows } = await query(sql, [Number(id)]);
  return rows[0] ?? null;
};

/**
 * Updates an existing task by ID.
 * Only updates fields that are explicitly provided.
 *
 * @param {string} id   - Task UUID
 * @param {{ title?: string, description?: string, status?: string, priority?: string, dueDate?: string, assignedTo?: string }} fields
 * @returns {Promise<object|null>} Updated task row or null if not found
 */
export const updateTask = async (id, fields) => {
  const allowed = ["title", "description", "status", "priority", "due_date", "assigned_to"];

  const columnMap = {
    title:       "title",
    description: "description",
    status:      "status",
    priority:    "priority",
    dueDate:     "due_date",
    assignedTo:  "assigned_to",
  };

  const setClauses = [];
  const values     = [];
  let   index      = 1;

  for (const [key, column] of Object.entries(columnMap)) {
    if (fields[key] !== undefined) {
      setClauses.push(`${column} = $${index++}`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(Number(id));

  const sql = `
    UPDATE tasks
    SET ${setClauses.join(", ")}, updated_at = NOW()
    WHERE task_number = $${index}
    RETURNING *
  `;

  const { rows } = await query(sql, values);
  return rows[0] ?? null;
};

/**
 * Deletes a task by its UUID.
 *
 * @param {string} id - Task UUID
 * @returns {Promise<object|null>} Deleted task row or null if not found
 */
export const deleteTask = async (id) => {
  const sql = `
    DELETE FROM tasks
    WHERE task_number = $1
    RETURNING *
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] ?? null;
};