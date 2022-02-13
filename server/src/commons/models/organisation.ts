import pgPromise from "pg-promise";
import { v4 as uuidv4 } from "uuid";
import { Result, createFailure, createSuccess, Organisation, isOrganisationList } from "sardine-dashboard-typescript-definitions";
import { getErrorMessage } from "../../utils/error-utils";

const organisationModel = (db: pgPromise.IDatabase<{}>) => {
  const fetchInvitations = (name: string) =>
    db.any(
      `
      SELECT invitation_tokens.id, organisation_id, token, expired_at, email,
      CASE
        WHEN expired_at >= NOW() then 'Active'
        ELSE 'Inactive' END
        AS status
      FROM invitation_tokens
      JOIN organisation ON invitation_tokens.organisation_id = organisation.id
      WHERE organisation.display_name = $1 ORDER BY invitation_tokens.id
    `,
      [name]
    );

  const generateInvitations = async (organisation: string, emails: string[]) => {
    const { id } = await db.one(
      `
      SELECT id from organisation
      WHERE display_name = $1
    `,
      [organisation]
    );
    return db.tx((t) => {
      const queries = emails.map((email) =>
        t.one(
          `
            INSERT INTO invitation_tokens
            (organisation_id, token, email) 
            VALUES($1, $2, $3) RETURNING token
          `,
          [id, uuidv4(), email],
          (a) => a.token
        )
      );
      return t.batch(queries);
    });
  };

  const hasOrganisationAccess = async (organisation: string, userId: string): Promise<boolean> => {
    const { has_access } = await db.one(
      `
      SELECT EXISTS
      (
        WITH uo AS (
          SELECT
            u.id as user_id,
            org.display_name as org_display_name,
            o.display_name as o_display_name
          FROM organisation org
          FULL JOIN organisation o ON o.client_id = org.parent_organization_uuid
          JOIN users u ON u.organisation_id = org.id OR u.organisation_id = o.id
        )
        SELECT *
        FROM uo
        WHERE user_id = $1 AND (org_display_name = $2 OR o_display_name = $2)
      ) as has_access
    `,
      [userId, organisation]
    );

    return !!has_access;
  };

  const getClientId = async (organisation: string): Promise<string | null> => {
    const result = await db.oneOrNone(
      `
      SELECT client_id FROM organisation WHERE display_name = $1
    `,
      [organisation]
    );
    return result ? result.client_id : null;
  };

  const getClientIdFromOrganizationId = async (organisationId: string) => {
    const result = await db.oneOrNone(
      `
      SELECT client_id FROM organisation WHERE id = $1
    `,
      [organisationId]
    );
    return result ? result.client_id : null;
  };

  const getClientIdResult = async (organisation: string): Promise<Result<string>> => {
    try {
      const clientId = await getClientId(organisation);
      if (clientId && typeof clientId === "string") {
        return createSuccess(clientId);
      }
      return createFailure(Error("Organisation not found"));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return createFailure(new Error(errorMessage));
    }
  };

  const createOrganisation = (clientId: string, name: string, isAdmin: boolean, userId: string, parentId: string) =>
    db.oneOrNone(
      `
      INSERT INTO organisation
      (display_name, client_id, created_by, is_admin, parent_organization_uuid) VALUES ($1, $2, $3, $4, $5) RETURNING id
    `,
      [name, clientId, userId, isAdmin, parentId]
    );

  /**
   * get org where
   *   - client_id = organisationIds
   *   - or has parent match the above criteria
   */
  const getFeatureOrganisations = async (organisationIds: string[]) => {
    // ($1, $2, $3)
    const queryPlaceHolders = organisationIds.map((_, index) => `$${index + 1}`).join(", ");

    const baseQuery = "SELECT client_id as clientID, display_name as name FROM organisation";
    if (organisationIds.length === 0) {
      const result = await db.many(baseQuery, []);
      return result;
    }
    const result = await db.manyOrNone(
      `
        ${baseQuery} where organisation.client_id in (${queryPlaceHolders})
      `,
      organisationIds
    );

    return result;
  };

  const getOrganisations = async (organisationID: string) => {
    const baseQuery = "SELECT client_id, display_name FROM organisation";
    if (organisationID.length === 0) {
      const result = await db.many(baseQuery, []);
      return result;
    }
    const client = await db.oneOrNone(`SELECT client_id FROM organisation WHERE id = $1`, [organisationID]);
    const clientID = client.client_id;

    const result = await db.manyOrNone(
      `
        ${baseQuery} where parent_organization_uuid = $1 or organisation.id = $2
      `,
      [clientID, organisationID]
    );
    return result;
  };

  const getOrganisationsResult = async (organisationID: string): Promise<Result<Organisation[]>> => {
    try {
      const organisations = await getOrganisations(organisationID);
      if (isOrganisationList(organisations)) {
        return createSuccess(organisations);
      }
      return createFailure(Error("Organisations not found"));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return createFailure(new Error(errorMessage));
    }
  };

  const getAdminOrganisations = async (organisationID: string) => {
    const baseQuery = `SELECT 
    organisation.client_id, 
    organisation.display_name, 
    u.id, 
    u.name, 
    u.email,
    u.deleted_at,
    u.is_email_verified 
    FROM organisation 
    full join users u 
    on u.organisation_id = organisation.id where organisation.client_id is not null `;

    if (organisationID.length === 0) {
      const result = await db.manyOrNone(baseQuery, []);
      return result;
    }
    const client = await db.oneOrNone(`SELECT client_id FROM organisation WHERE id = $1`, [organisationID]);
    const clientID = client.client_id;

    const result = await db.manyOrNone(
      `
        ${baseQuery} and parent_organization_uuid = $1 or organisation.id = $2
      `,
      [clientID, organisationID]
    );
    return result;
  };

  return {
    fetchInvitations,
    generateInvitations,
    hasOrganisationAccess,
    getClientId,
    getClientIdResult,
    createOrganisation,
    getOrganisations,
    getOrganisationsResult,
    getAdminOrganisations,
    getFeatureOrganisations,
    getClientIdFromOrganizationId,
  };
};

export default organisationModel;
