import pgPromise from "pg-promise";
import { CreateBlockAllowlistRequestBody, UpdateBlockAllowlistRequestBody } from "sardine-dashboard-typescript-definitions";

const allowlistModel = (db: pgPromise.IDatabase<{}>) => {
  const getAllowlist = (clientId: string) =>
    db.any(
      `
      SELECT * FROM whitelists 
      where client_id = $1 
      and deleted_at is null 
      and expiry > NOW()
      limit 1000
    `,
      [clientId]
    );

  const addToAllowlist = async (req: CreateBlockAllowlistRequestBody, clientId: string, userId: string) => {
    db.tx((t) => {
      const queries = req.data.map((l) =>
        t.none(
          `
          INSERT INTO whitelists (client_id, type, reason, value, scope, expiry, created_by, created_at, updated_at)
          values ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `,
          [clientId, l.type, "dashboard", l.value, req.scope, req.expiry, userId]
        )
      );
      return t.batch(queries);
    })
      .then((data) => data)
      .catch((error) => error);
  };

  const updateAllowlist = (id: string, req: UpdateBlockAllowlistRequestBody, clientId: string) =>
    db.none(
      `
      UPDATE whitelists
      SET  type = $3, value = $4, scope = $5, expiry = $6, updated_at = NOW()
      WHERE id = $1 and client_id = $2
    `,
      [id, clientId, req.type, req.value, req.scope, req.expiry]
    );

  const removeFromAllowlist = (id: string, clientId: string) =>
    db.none(
      `
      UPDATE whitelists SET deleted_at = NOW() where id = $1 and client_id = $2
    `,
      [id, clientId]
    );

  return {
    getAllowlist,
    addToAllowlist,
    updateAllowlist,
    removeFromAllowlist,
  };
};

export default allowlistModel;
