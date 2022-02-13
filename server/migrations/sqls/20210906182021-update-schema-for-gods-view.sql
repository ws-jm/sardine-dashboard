-- Enum modifications for gods view
ALTER TYPE user_roles RENAME VALUE 'superadmin' TO 'sardine_admin';
ALTER TYPE user_roles RENAME VALUE 'admin' TO 'user';
ALTER TYPE user_roles ADD VALUE 'multi_org_admin';

-- Adding deleted at for remove user feature
ALTER TABLE users ADD COLUMN deleted_at timestamptz;
-- Adding parent id & is admin for gods view
ALTER TABLE organisation ADD COLUMN parent_organization_uuid text, ADD COLUMN is_admin bool;
