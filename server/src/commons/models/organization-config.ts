import pgPromise from "pg-promise";

const organizationConfig = (db: pgPromise.IDatabase<{}>) => {
  const isDisablePasswordLogin = (organizationID: string) =>
    db.oneOrNone(`SELECT disable_password_login FROM organization_config WHERE organization_id = $1`, [organizationID]);

  return {
    isDisablePasswordLogin,
  };
};
export default organizationConfig;
