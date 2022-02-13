import { BigQuery } from "@google-cloud/bigquery";

const bigQueryClient = new BigQuery();

export class BigQueryClient {
  public static async queryMany(query: string, params: object) {
    const options = {
      query,
      location: "US",
      params,
    };

    const [job] = await bigQueryClient.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    return rows;
  }
}
