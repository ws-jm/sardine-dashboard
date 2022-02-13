ALTER DATABASE sardinedb SET timezone TO 'UTC';

CREATE TABLE organisation (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  display_name text NOT NULL,
  created_by bigint,
  created_at timestamptz default NOW()
);

CREATE TABLE organisation_credentials (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  organisation_id bigint REFERENCES organisation(id),
  client_id text NOT NULL,
  client_secret TEXT NOT NULL,
  is_deleted boolean DEFAULT false,
  deleted_by bigint,
  deleted_at timestamptz
);

CREATE UNIQUE INDEX organisation_client_id_secret ON organisation_credentials(client_id, client_secret);

CREATE TYPE user_roles AS ENUM('admin', 'superadmin');

CREATE TABLE users (
  id bigserial PRIMARY KEY NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  firebase_user_id text NOT NULL,
  organisation_id bigint REFERENCES organisation(id),
  user_role  user_roles default 'admin',
  is_email_verified boolean default false
);

ALTER TABLE organisation
ADD FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE organisation_credentials
ADD FOREIGN KEY (deleted_by) REFERENCES users(id);

CREATE TABLE superadmin_emails (
  id bigserial PRIMARY KEY NOT NULL,
  email text NOT NULL
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id bigint REFERENCES users(id),
  ip_address inet NOT NULL,
  logged_out_at  timestamptz NULL,
  expired_at timestamptz  NOT NULL DEFAULT NOW() + INTERVAL '15 minutes',
  created_at timestamptz  NOT NULL DEFAULT NOW()
);

CREATE VIEW active_sessions AS (
  SELECT *
  FROM sessions
  WHERE expired_at >= NOW()
  AND logged_out_at IS NULL
);


CREATE TABLE error_logs (
  id bigserial PRIMARY KEY,
  created_at timestamptz  NOT NULL DEFAULT NOW(),
  msg text NULL,
  stack text NULL,
  db_query text NULL,
  db_code text NULL,
  source text NOT NULL,
  req_id uuid NULL,
  user_id bigint NULL,
  mail_info text NULL,
  to_email text NULL,
  currency integer NULL,
  is_hidden boolean
);


CREATE TABLE invitation_tokens (
  id bigserial PRIMARY KEY,
  organisation_id bigint REFERENCES organisation(id),
  token uuid,
  expired_at timestamptz  NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);
