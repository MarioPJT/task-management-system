-- =============================================================================
-- Team Task Management System — Database Schema
-- PostgreSQL 14+
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE user_role     AS ENUM ('ADMIN', 'USER');
CREATE TYPE task_status   AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- ─── Utility: auto-updated updated_at ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE: users
-- =============================================================================

CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         CITEXT        NOT NULL,
  password_hash TEXT          NOT NULL,
  role          user_role     NOT NULL DEFAULT 'USER',
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_name_length  CHECK  (CHAR_LENGTH(TRIM(name)) >= 2)
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_users_role      ON users (role);
CREATE INDEX idx_users_is_active ON users (is_active);

-- =============================================================================
-- TABLE: tasks
-- =============================================================================

CREATE TABLE tasks (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255)  NOT NULL,
  description  TEXT,
  status       task_status   NOT NULL DEFAULT 'PENDING',
  priority     task_priority NOT NULL DEFAULT 'MEDIUM',
  due_date     DATE,
  creator_id   UUID          NOT NULL,
  assignee_id  UUID,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT tasks_creator_fk
    FOREIGN KEY (creator_id)
    REFERENCES users (id)
    ON DELETE RESTRICT,

  CONSTRAINT tasks_assignee_fk
    FOREIGN KEY (assignee_id)
    REFERENCES users (id)
    ON DELETE SET NULL,

  CONSTRAINT tasks_title_length
    CHECK (CHAR_LENGTH(TRIM(title)) >= 3),

  CONSTRAINT tasks_due_date_valid
    CHECK (due_date IS NULL OR due_date >= CURRENT_DATE)
);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX idx_tasks_creator_id  ON tasks (creator_id);
CREATE INDEX idx_tasks_assignee_id ON tasks (assignee_id);
CREATE INDEX idx_tasks_status      ON tasks (status);
CREATE INDEX idx_tasks_priority    ON tasks (priority);
CREATE INDEX idx_tasks_due_date    ON tasks (due_date);

-- Composite: filter by assignee + status (common query pattern)
CREATE INDEX idx_tasks_assignee_status ON tasks (assignee_id, status);

-- =============================================================================
-- TABLE: refresh_tokens
-- =============================================================================

CREATE TABLE refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  token       TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN     NOT NULL DEFAULT FALSE,
  revoked_at  TIMESTAMPTZ,
  user_agent  TEXT,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT refresh_tokens_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE,

  CONSTRAINT refresh_tokens_token_unique UNIQUE (token),

  CONSTRAINT refresh_tokens_revoked_at_valid
    CHECK (revoked = FALSE OR revoked_at IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token      ON refresh_tokens (token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- Partial index: only active (non-revoked) tokens
CREATE INDEX idx_refresh_tokens_active
  ON refresh_tokens (user_id, expires_at)
  WHERE revoked = FALSE;

-- =============================================================================
-- Seed: default admin user
-- (password: Admin1234! — replace hash in production)
-- =============================================================================

INSERT INTO users (name, email, password_hash, role) VALUES (
  'Admin',
  'admin@example.com',
  '$2b$12$placeholder_replace_with_real_bcrypt_hash',
  'ADMIN'
);