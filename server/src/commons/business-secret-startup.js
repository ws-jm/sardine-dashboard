const { getSecretValue } = require("./secrets");

start();
async function start() {
  try {
    console.log(await getSecretValue("dashboard-business-db-config"));
  } catch {
    console.log("");
  }
}
