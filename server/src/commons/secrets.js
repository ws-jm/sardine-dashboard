const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { exec } = require("child_process");

const client = new SecretManagerServiceClient();

async function getSecretValue(secretID) {
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${secretID}/versions/latest`,
    });
    const secretValue = version.payload.data.toString("utf8");
    return secretValue;
  } catch (e) {
    console.log(e);
  }
}

async function loadSecrets() {
  process.env.AUTH_SERVICE_ACCESSOR = await getSecretValue("auth-service-accessor");
  process.env.AUTH_SERVICE_CREATOR = await getSecretValue("auth-service-creator");

  process.env.RULE_ENGINE_ACCESSOR = await getSecretValue("rule-engine-accessor");
  process.env.RULE_ENGINE_CREATOR = await getSecretValue("rule-engine-creator");

  process.env.METABASE_SECRET_KEY = await getSecretValue("metabase-secret");
  process.env.UNLEASH_SECRET_KEY = await getSecretValue("unleash-dashboard-key");
  process.env.SENDGRID_SECRET = await getSecretValue("dashboard-sendgrid-apikey");
  process.env.SARDINE_API_INTERNAL_KEY = await getSecretValue("dashboard-sardine-api-internal-key");
  // NOTE: when you add new secret, make sure to update terraform for google_secret_manager_secret_iam_member.
}

async function getEsUrl() {
  if (process.env.ES_URL) {
    return process.env.ES_URL;
  }

  const esHost = await getSecretValue("elasticsearch-host");
  const esPass = await getSecretValue("elasticsearch-password");
  const esUser = await getSecretValue("elasticsearch-user");
  process.env.ES_URL = `https://${esUser}:${esPass}@${esHost.split("https://")[1]}`;

  return process.env.ES_URL;
}

module.exports = {
  getSecretValue,
  loadSecrets,
  getEsUrl,
};
