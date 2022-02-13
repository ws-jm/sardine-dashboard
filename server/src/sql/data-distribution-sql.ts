const deviceSessionRiskLevelBreakdownSql = ({ isAllClients }: { isAllClients: boolean }) => `
SELECT 
case 
  when endpoint='/v2/devices' then JSON_EXTRACT_SCALAR(response_body, "$.level")
  when endpoint='/internal/v1/devices' then JSON_EXTRACT_SCALAR(response_body, "$.sessionRisk")
end as risk_level
  , DATE(timestamp) as date
  , COUNT(distinct JSON_EXTRACT_SCALAR(response_body, "$.sessionKey")) as count
FROM \`structured_logs.request_responses\`
WHERE (endpoint = '/v2/devices' or endpoint = '/internal/v1/devices')
  AND response_status_code = 200
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @dateInterval DAY)
  AND (case 
    when endpoint='/v2/devices' then JSON_EXTRACT_SCALAR(response_body, "$.level")
    when endpoint='/internal/v1/devices' then JSON_EXTRACT_SCALAR(response_body, "$.sessionRisk")
  end is not null)
  ${isAllClients ? "" : `AND (client_id = @clientId)`}
GROUP BY 1, 2
ORDER BY 1, 2
`;

const customerRiskLevelSessionDistributionSql = ({ isAllClients }: { isAllClients: boolean }) => `
SELECT date(timestamp) as date, risk_level, count(1) as count 
FROM \`structured_logs.customer_responses\`
WHERE timestamp >= timestamp_sub( current_timestamp(), INTERVAL @dateInterval DAY) 
 ${isAllClients ? "" : `AND (client_id = @clientId)`}
group by 1, 2
order by 1
`;

const customerEmailRiskLevelDistributionSql = ({ isAllClients }: { isAllClients: boolean }) => `
SELECT date(timestamp) as date, emailLevel as risk_level, count(1) as count 
FROM \`structured_logs.customer_responses\`
WHERE timestamp >= timestamp_sub( current_timestamp(), INTERVAL @dateInterval DAY) 
 ${isAllClients ? "" : `AND (client_id = @clientId)`}
group by 1, 2
order by 1
`;

export { deviceSessionRiskLevelBreakdownSql, customerRiskLevelSessionDistributionSql, customerEmailRiskLevelDistributionSql };
