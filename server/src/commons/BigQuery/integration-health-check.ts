import { BigQueryClient } from "./BigQuery";

interface Params {
  clientId?: string;
  day?: number;
}

export class IntegrationHealthCheckBigQuery {
  public static async queryInboundRequests(params: Params) {
    const query = `
    SELECT * FROM structured_logs.request_responses 
WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @day DAY)
AND endpoint!='/internal/v1/devices'
${params.clientId ? "AND client_id=@clientId" : ""}
ORDER BY timestamp DESC
LIMIT 100
    `;

    return BigQueryClient.queryMany(query, params);
  }

  public static async queryOutboundRequests(params: Params) {
    const query = `
    SELECT * FROM structured_logs.outbound_request_responses 
WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @day DAY)
${params.clientId ? "AND client_id=@clientId" : ""}
AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @day DAY)
AND url not like '%cloud.es.io%'
AND url not like '%device%' 
AND url not like '%locationiq%'
ORDER BY timestamp DESC
LIMIT 100
    `;

    return BigQueryClient.queryMany(query, params);
  }

  public static async queryEvents(params: Params) {
    const query = `
SELECT device_token.os_family, client_metadata.flow, client_metadata.user_id_hash, server_metadata.time,server_metadata.remote_ip, source 
FROM devices.events 
WHERE (_PARTITIONTIME >  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 3 DAY) OR _PARTITIONTIME IS NULL)
${params.clientId ? `AND client_id=@clientId` : ""}
ORDER BY server_metadata.time DESC
LIMIT 100
    `;

    return BigQueryClient.queryMany(query, params);
  }
}
