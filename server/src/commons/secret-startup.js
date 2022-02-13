const { getSecretValue } = require("./secrets");

start();
async function start() {
  try {
    console.log(await getSecretValue("dashboard-psql-url"));
  } catch {
    console.log("");
  }
}
