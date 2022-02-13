const { Client } = require("@elastic/elasticsearch");
const { getEsUrl } = require("../../commons/secrets");

export async function loadEsClient() {
  const node = await getEsUrl();
  const client = new Client({
    node,
  });

  return client;
}
