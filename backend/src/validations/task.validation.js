const VALID_STATUSES    = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const VALID_PRIORITIES  = ["LOW", "MEDIUM", "HIGH"];
const ISO_DATE_REGEX    = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates task input data for create and update operations.
 *
 * @param {object}  data          - Fields to validate
 * @param {boolean} requireTitle  - Whether title is required (true for create, false for update)
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateTaskData = (data = {}, requireTitle = true) => {
  const errors = [];

  // ─── Title ────────────────────────────────────────────────────────────────

  if (requireTitle) {
    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
      errors.push("Title is required and must be a non-empty string");
    } else if (data.title.trim().length < 3) {
      errors.push("Title must be at least 3 characters long");
    } else if (data.title.trim().length > 255) {
      errors.push("Title must not exceed 255 characters");
    }
  } else if (data.title !== undefined) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      errors.push("Title must be a non-empty string");
    } else if (data.title.trim().length < 3) {
      errors.push("Title must be at least 3 characters long");
    } else if (data.title.trim().length > 255) {
      errors.push("Title must not exceed 255 characters");
    }
  }

  // ─── Description (optional) ───────────────────────────────────────────────

  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else if (data.description.length > 2000) {
      errors.push("Description must not exceed 2000 characters");
    }
  }

  // ─── Status ───────────────────────────────────────────────────────────────

  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
  }

  // ─── Priority ─────────────────────────────────────────────────────────────

  if (data.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(data.priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
  }

  // ─── Due Date (optional) ──────────────────────────────────────────────────

  if (data.dueDate !== undefined && data.dueDate !== null) {
    if (!ISO_DATE_REGEX.test(data.dueDate)) {
      errors.push("Due date must be a valid date in YYYY-MM-DD format");
    } else {
      const date = new Date(data.dueDate);
      if (isNaN(date.getTime())) {
        errors.push("Due date is not a valid calendar date");
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          errors.push("Due date must not be in the past");
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};