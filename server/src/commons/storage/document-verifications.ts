export const DOCUMENT_IMAGE_BUCKET_NAME =
  process.env.SARDINE_ENV === "production" ? "uploaded-files-sardine-ai-prod" : "uploaded-files-sardine-ai-dev";
