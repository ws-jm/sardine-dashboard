CREATE TABLE organization_config (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  organization_id bigint REFERENCES organisation(id),
  disable_password_login BOOLEAN NOT NULL DEFAULT false
);
