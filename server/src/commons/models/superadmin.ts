import pgPromise from "pg-promise";

const superadminModel = (db: pgPromise.IDatabase<{}>) => {
  const getCredentialsById = (id: string) =>
    db.any(
      `
      SELECT * FROM organisation_credentials
      WHERE organisation_id = $1;
    `,
      [id]
    );

  const revokeCredentialsById = (id: string, userId: string) =>
    db.none(
      `
      UPDATE organisation_credentials
      SET is_deleted = true, deleted_by = $1, deleted_at = NOW()
      WHERE id = $2
    `,
      [userId, id]
    );

  const getClientId = async (organisation: string) => {
    const result = await db.oneOrNone(
      `
      SELECT client_id from organisation WHERE display_name = $1
    `,
      [organisation]
    );

    if (!result) {
      throw new Error("NOT_FOUND");
    }

    return result.client_id;
  };

  return {
    getCredentialsById,
    revokeCredentialsById,
    getClientId,
  };
};

export default superadminModel;
