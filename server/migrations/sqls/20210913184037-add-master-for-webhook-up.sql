CREATE TYPE webhook_types AS ENUM('case-status');

CREATE TABLE organization_webhooks (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  type webhook_types default 'case-status',
  url TEXT,
  secret TEXT NOT NULL,
  created_at timestamptz default NOW(),
  updated_at timestamptz,
  deleted_at timestamptz
);
