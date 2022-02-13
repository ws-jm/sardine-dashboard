/* Replace with your SQL commands */
CREATE TABLE organization_jira (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  email TEXT,
  token TEXT,
  url TEXT,
  created_at timestamptz default NOW(),
  updated_at timestamptz,
  deleted_at timestamptz
);