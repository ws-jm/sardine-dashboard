import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

export const generateSignedUrl = async (filePath: string, bucketName: string) => {
  // These options will allow temporary read access to the file
  const options = {
    version: "v4" as "v4",
    action: "read" as "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  // Get a v4 signed URL for reading the file
  const [url] = await storage.bucket(bucketName).file(filePath).getSignedUrl(options);
  return url;
};
