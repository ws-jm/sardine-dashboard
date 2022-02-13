const { createReadStream } = require("fs");
const split = require("split2");
const path = require("path");

const { Client } = require("@elastic/elasticsearch");

const client = new Client({ node: "http://localhost:9200/" });

const INDEX_NAME = "dashboard_metrics";

const createIndex = async () => {
  console.log("creating new index");

  return client.indices.create({
    index: INDEX_NAME,
    body: {
      mappings: {
        properties: {
          datetime: {
            type: "date",
            format: "yyyy-MM-dd HH:mm:ss",
          },
          request_id: {
            type: "keyword",
          },
          client_id: {
            type: "keyword",
          },
          session_key: {
            type: "keyword",
          },
          device_id: {
            type: "keyword",
          },
          user_id_hash: {
            type: "keyword",
          },
          screen_resolution: {
            type: "keyword",
          },
          fingerprint_v1: {
            type: "keyword",
          },
          fingerprint_v1_1: {
            type: "keyword",
          },
          os_family: {
            type: "keyword",
          },
          user_agent_family: {
            type: "keyword",
          },
          country: {
            type: "keyword",
          },
          region: {
            type: "keyword",
          },
          city: {
            type: "keyword",
          },
          location: {
            type: "geo_point",
          },
        },
      },
    },
  });
};

const bulkIndex = async () => {
  try {
    const result = await client.helpers.bulk({
      datasource: createReadStream(path.join(__dirname, "dataset.json")).pipe(
        split((data) => {
          const parsed = JSON.parse(data);
          return {
            ...parsed,
            datetime: parsed.datetime.replace(/^(.*)\sUTC$/, (_m, p1) => p1),
            location: `${parsed.latitude}, ${parsed.longitude}`,
          };
        })
      ),
      onDocument(doc) {
        return {
          create: {
            _index: "dashboard_metrics",
            _id: doc.request_id,
          },
        };
      },
    });

    console.log("bulk index completed", result);
  } catch (e) {
    console.log(e.meta.body.error, e, "some error");
    // console.log(e);
  }
};

const run = async () => {
  try {
    // Drop previous index if any
    const response = await client.indices.exists({ index: INDEX_NAME });
    console.log(response);
    if (response.body) {
      await client.indices.delete({
        index: INDEX_NAME,
      });
      console.log("index_dropped");
    }

    // Create new index
    await createIndex();
    console.log("index created");
    await bulkIndex();
  } catch (e) {
    console.log(e);
    // console.log(e.meta.body.error, e, 'some error');
  }
};

run();
