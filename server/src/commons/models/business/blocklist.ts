import pgPromise from "pg-promise";
import { CreateBlockAllowlistRequestBody, UpdateBlockAllowlistRequestBody } from "sardine-dashboard-typescript-definitions";

const blocklistModel = (db: pgPromise.IDatabase<{}>) => {
  const getBlocklist = (clientId: string) =>
    db.any(
      `
      SELECT * FROM blacklists 
      where client_id = $1 
      and deleted_at is null 
      and expiry > NOW()
      limit 1000
    `,
      [clientId]
    );

  const addToBlocklist = async (req: CreateBlockAllowlistRequestBody, clientId: string, userId: string) => {
    db.tx((t) => {
      const queries = req.data.map((l) =>
        t.none(
          `
          INSERT INTO blacklists (client_id, type, reason, value, scope, expiry, created_by, created_at, updated_at)
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

  const updateBlocklist = (id: string, req: UpdateBlockAllowlistRequestBody, clientId: string) =>
    db.none(
      `
      UPDATE blacklists
      SET  type = $3, reason = $4, value = $5, scope = $6, expiry = $7, updated_at = NOW()
      WHERE id = $1 and client_id = $2
    `,
      [id, clientId, req.type, "dashboard", req.value, req.scope, req.expiry]
    );

  const removeFromBlocklist = (id: string, clientId: string) =>
    db.none(
      `
      UPDATE blacklists SET deleted_at = NOW() where id = $1 and client_id = $2
    `,
      [id, clientId]
    );

  return {
    getBlocklist,
    addToBlocklist,
    updateBlocklist,
    removeFromBlocklist,
  };
};

export default blocklistModel;
