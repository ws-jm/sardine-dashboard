import pgPromise from "pg-promise";

const jiraModel = (db: pgPromise.IDatabase<{}>) => {
  const getTokenData = (clientId: string) =>
    db.oneOrNone(
      `
      SELECT token, email, url FROM organization_jira WHERE client_id = $1
    `,
      [clientId]
    );

  const createToken = async (clientId: string, token: string, email: string, url: string) => {
    const data = await getTokenData(clientId);
    if (data && data.token) {
      return updateToken(clientId, token, email, url);
    }

    return db.one(
      `
      INSERT INTO organization_jira
      (client_id, token, email, url) VALUES ($1, $2, $3, $4) RETURNING id
    `,
      [clientId, token, email, url]
    );
  };

  const updateToken = (clientId: string, token: string, email: string, url: string) =>
    db.one(
      `
      UPDATE organization_jira SET token = $1, email = $2, url = $3, updated_at = now() WHERE client_id = $4 RETURNING id
    `,
      [token, email, url, clientId]
    );

  const deleteToken = (id: string) =>
    db.oneOrNone(
      `
      UPDATE organization_jira SET deleted_at = now() WHERE id = $1 RETURNING id
    `,
      [id]
    );

  return {
    getTokenData,
    createToken,
    updateToken,
    deleteToken,
  };
};

export default jiraModel;
