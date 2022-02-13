import { writeFile } from "fs/promises";

const ENV_GCP_CREDS_BASE64 = `GCP_CREDS_BASE64`;

const main = async () => {
  const base64Creds = process.env[ENV_GCP_CREDS_BASE64] || "";
  if (!base64Creds) {
    console.error(`Environment variable ${ENV_GCP_CREDS_BASE64} is missing.`);
    process.exitCode = 1;
    return;
  }
  const result = Buffer.from(base64Creds, "base64").toString("utf8");
  const path = process.env["GOOGLE_APPLICATION_CREDENTIALS"] || "../google-application-credentials.json";
  await writeFile(path, result).catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
};

main()
  .then()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
