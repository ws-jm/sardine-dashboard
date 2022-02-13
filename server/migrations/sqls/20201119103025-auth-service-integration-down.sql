ALTER TABLE organisation DROP COLUMN client_id;

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
