import pgPromise from "pg-promise";

const auditModel = (db: pgPromise.IDatabase<{}>) => {
  const getLogs = (clientId: string, startDate: string, endDate: string, offset: number, limit: number) =>
    db.oneOrNone(
      `
      SELECT * FROM audit_log WHERE client_id = $1 AND created_at >= $2 AND created_at <= $3 ORDER BY created_at DESC OFFSET $4 LIMIT $5
    `,
      [clientId, startDate, endDate, offset, limit]
    );

  const createLog = (clientId: string, type: string, targetId: number, actorId: number, metadata: JSON) =>
    db.one(
      `
      INSERT INTO audit_log
      (client_id, type, target_id, actor_id, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id
    `,
      [clientId, type, targetId, actorId, metadata]
    );

  return {
    getLogs,
    createLog,
  };
};

export default auditModel;
