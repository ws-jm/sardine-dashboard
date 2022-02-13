import pgPromise from "pg-promise";

const authModel = (db: pgPromise.IDatabase<{}>) => {
  const getSuperadminEmails = () =>
    db.any(`
      SELECT * FROM superadmin_emails
    `);

  const getOrganisations = () => db.any(`SELECT * FROM organisation`);

  const createOrganisaion = (display_name: string, userId: string) =>
    db.one(
      `
      INSERT INTO organisation ( display_name, created_by)
      values ($1, $2)
      RETURNING *
    `,
      [display_name, userId]
    );

  const checkSuperAdmin = async (email: string | undefined) => {
    if (!email) {
      return false;
    }
    const result = await db.one(
      `
      SELECT EXISTS (
        SELECT * FROM superadmin_emails
        WHERE email = $1
      ) as is_superadmin
    `,
      [email]
    );

    return result.is_superadmin;
  };

  const createSuperadmin = async (name: string = "", email: string, email_verified: boolean, uid: string) => {
    const user = await db.oneOrNone(
      `
      SELECT * FROM users WHERE email = $1
    `,
      [email]
    );
    if (user) {
      return user;
    }
    return db.one(
      `
      INSERT INTO users (name, email, user_role, is_email_verified, firebase_user_id)
      values ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [name, email, "sardine_admin", email_verified, uid]
    );
  };

  const retriveEmail = async (token: string) => {
    const result = await db.one(
      `
      SELECT email FROM invitation_tokens WHERE token = $1
    `,
      [token]
    );
    return result ? result.email : null;
  };

  const createUser = async (
    name: string = "",
    email: string,
    email_verified: boolean,
    organisation: string,
    uid: string,
    token: string,
    isAdmin: boolean
  ) => {
    const user = await db.oneOrNone(
      `
      SELECT * FROM users WHERE email = $1
    `,
      [email]
    );
    if (user) {
      return user;
    }
    return db.tx(async (t) => {
      const newUser = await t.one(
        `
          INSERT INTO users (name, email, organisation_id, user_role, is_email_verified, firebase_user_id)
          VALUES
          ( $1, $2, $3, $4, $5, $6 )
          RETURNING *
      `,
        [name, email, organisation, isAdmin ? "multi_org_admin" : "user", email_verified, uid]
      );

      await t.one(
        `
        UPDATE invitation_tokens
        SET expired_at = NOW() WHERE token = $1
        RETURNING *
      `,
        [token]
      );

      return newUser;
    });
  };

  const checkInvitationToken = (token: string) =>
    db.oneOrNone(
      `
      SELECT * from invitation_tokens WHERE token = $1
      AND expired_at >= NOW()
    `,
      [token]
    );

  const isAdminUser = (organisation_id: string) =>
    db.oneOrNone(
      `
      SELECT is_admin from organisation WHERE id = $1
    `,
      [organisation_id]
    );

  const getUserByFirebaseUid = (uid: string) =>
    db.one(
      `
    SELECT u.id, u.name, u.email, u.is_email_verified, u.user_role, u.organisation_id,
    o.display_name as organisation
    FROM users u
    LEFT JOIN organisation o ON o.id = u.organisation_id
    WHERE
    firebase_user_id = $1`,
      [uid]
    );

  const isExistingUser = async (email: string | undefined) => {
    if (!email) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { is_existing_user }: { is_existing_user: boolean } = await db.one(
      `
      SELECT EXISTS (
        SELECT * FROM users 
        WHERE email = $1
      ) as is_existing_user
    `,
      [email]
    );

    return is_existing_user;
  };

  const getAllUsers = () =>
    db.many(
      `
    SELECT u.name, u.email, u.organisation_id, o.display_name as organisation
    FROM users u
    INNER JOIN organisation o ON o.id = u.organisation_id
    `,
      []
    );

  const getAllUsersData = () =>
    db.many(
      `
    SELECT id, name, email, organisation_id FROM users
    `,
      []
    );

  const getAllAdminUsers = () =>
    db.manyOrNone(
      `
      SELECT display_name, client_id FROM organisation where is_admin = true
    `,
      []
    );

  const getOrganizationUsers = (value: string, isClientId: boolean = false) =>
    db.manyOrNone(
      `
    SELECT u.id, u.name, u.email, u.organisation_id, o.display_name as organisation
    FROM users u
    INNER JOIN organisation o ON o.id = u.organisation_id
    WHERE ${isClientId ? "o.client_id = $1" : "o.display_name = $1"}
    `,
      [value]
    );

  const deleteUser = (uid: string) =>
    db.none(
      `
      update users set deleted_at = now() where id = $1
    `,
      [uid]
    );

  return {
    getSuperadminEmails,
    getOrganisations,
    createOrganisaion,
    checkSuperAdmin,
    createSuperadmin,
    createUser,
    checkInvitationToken,
    getUserByFirebaseUid,
    isExistingUser,
    getAllUsers,
    getOrganizationUsers,
    getAllUsersData,
    isAdminUser,
    getAllAdminUsers,
    deleteUser,
    retriveEmail,
  };
};

export default authModel;
