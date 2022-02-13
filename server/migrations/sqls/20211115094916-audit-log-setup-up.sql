CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  type TEXT NOT NULL,
  target_id bigint,
  actor_id bigint NOT NULL,
  metadata jsonb,
  created_at timestamptz default NOW(),
  updated_at timestamptz,
  deleted_at timestamptz
);