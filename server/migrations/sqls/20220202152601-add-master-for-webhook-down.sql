DELETE FROM pg_enum
WHERE enumlabel = 'document_verification'
AND enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'webhook_types'
)