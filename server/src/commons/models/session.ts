// const { v4: uuidV4 } = require("uuid");
import pgPromise from "pg-promise";
import { v4 as uuidV4 } from "uuid";

const sessionModel = (db: pgPromise.IDatabase<{}>) => {
  const getUserBySessionId = async (sessionId: string) => {
    const user = await db.oneOrNone(
      `
    SELECT users.*,
    o.display_name as organisation 
    FROM users 
    LEFT JOIN organisation o ON o.id = users.organisation_id
      JOIN active_sessions ON users.id = active_sessions.user_id 
      WHERE active_sessions.id = $1 
    GROUP BY users.id, o.id`,
      sessionId
    );
    return user;
  };

  const createSession = async (userId: string, expires: string, ip: string | string[]) => {
    const result = await db.one(
      "INSERT INTO sessions (id, user_id, expired_at, ip_address) VALUES ($1, $2, NOW() + $3::interval, $4) RETURNING *",
      [uuidV4(), userId, expires, ip]
    );
    return result;
  };

  const logoutSession = async (userId: string, sessionId: string) => {
    const result = await db.oneOrNone("UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1 AND id = $2 RETURNING id", [
      userId,
      sessionId,
    ]);
    return result.id;
  };

  const logoutAllSessions = async (userId: string) => {
    await db.none("UPDATE sessions set logged_out_at = NOW() WHERE user_id = $1", userId);
  };

  const getActiveSessions = async (userId: string) => {
    const result = await db.any("SELECT * FROM active_sessions WHERE user_id = $1", userId);
    return result;
  };

  const getActiveSessionsOfOrganisations = async () => {
    const result = await db.any(
      "select organisation.id , organisation.name, users.email, active_sessions.ip_address, active_sessions.created_at from active_sessions inner join users on active_sessions.user_id = users.id inner join organisation on users.organisation_id = organisation.id  order by organisation.id "
    );
    return result;
  };

  const getLastSeenForUser = async (userId: string) => {
    const result = await db.one("SELECT MAX(created_at) as last_seen FROM sessions WHERE user_id = $1", userId);
    return result.last_seen;
  };

  // TODO FIX
  const logoutAllSessionsWithoutAllowlistedIps = async (userId: string) => {
    const result = await db.any(
      "UPDATE sessions set logged_out_at = NOW() FROM allowlisted_ips WHERE sessions.user_id = allowlisted_ips.user_id AND sessions.ip_address != allowlisted_ips.ip_address AND sessions.user_id = $1 AND sessions.logged_out_at IS NULL RETURNING sessions.id",
      userId
    );
    return result.map((s) => s.id);
  };

  const getLoggedInIps = async () => {
    const result = await db.any("SELECT DISTINCT(ip_address) FROM sessions");
    return result;
  };

  const isPrevUserIpOrDevice = async (userId: string, fingerprint: string, ipAddress: string) => {
    const { is_prev_ip_or_device: isPrevIpOrDevice } = await db.one(
      `
      SELECT EXISTS (SELECT * FROM sessions WHERE user_id = $1 AND (fingerprint = $2 OR ip_adsdress = $3))
      As is_prev_ip_or_device
    `,
      [userId, fingerprint, ipAddress]
    );

    return isPrevIpOrDevice;
  };

  return {
    isPrevUserIpOrDevice,
    getUserBySessionId,
    createSession,
    logoutSession,
    logoutAllSessions,
    getActiveSessions,
    getActiveSessionsOfOrganisations,
    getLastSeenForUser,
    logoutAllSessionsWithoutAllowlistedIps,
    getLoggedInIps,
  };
};

export default sessionModel;
