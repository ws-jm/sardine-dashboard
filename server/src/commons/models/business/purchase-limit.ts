import pgPromise from "pg-promise";
import { PurchaseLimitRequestBody } from "sardine-dashboard-typescript-definitions";

const purchaseLimit = (db: pgPromise.IDatabase<{}>) => {
  const getPurchaseLimitsByClientID = (clientId: string) => {
    if (!clientId) {
      return db.query(`
                SELECT *
                FROM   purchase_limits
                WHERE  client_id IS NULL
                       AND deleted_at IS NULL; `);
    }
    return db.query(
      `
                SELECT *
                FROM   purchase_limits
                WHERE  client_id = $1
                       AND deleted_at IS NULL; `,
      [clientId]
    );
  };

  const createPurchaseLimit = (req: PurchaseLimitRequestBody) =>
    db.none(
      `
                INSERT INTO 
                    purchase_limits (created_at, updated_at, customer_risk_level, 
                    daily_limit_usd,weekly_limit_usd, monthly_limit_usd, client_id, hold_days, 
                    instant_limit_usd,min_amount, max_amount)
                VALUES 
                (now(), now() , $1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        req.customer_risk_level,
        req.daily_limit_usd,
        req.weekly_limit_usd,
        req.monthly_limit_usd,
        req.client_id,
        req.hold_days,
        req.instant_limit_usd,
        req.min_amount,
        req.max_amount,
      ]
    );

  const deletePurchaseLimit = (id: number) =>
    db.none(
      `
                UPDATE
                    public.purchase_limits
                SET deleted_at = now(),
                    updated_at = now()
                WHERE id = $1 ;`,
      [id]
    );

  const updatePurchaseLimit = (req: PurchaseLimitRequestBody) =>
    db.none(
      `
                UPDATE purchase_limits
                SET    updated_at = now(),
                       customer_risk_level = $2,
                       daily_limit_usd = $3,
                       weekly_limit_usd = $4,
                       monthly_limit_usd = $5,
                       client_id = $6,
                       hold_days = $7,
                       instant_limit_usd = $8,
                       min_amount = $9,
                       max_amount = $10
                WHERE  id = $1; `,
      [
        req.id,
        req.customer_risk_level,
        req.daily_limit_usd,
        req.weekly_limit_usd,
        req.monthly_limit_usd,
        req.client_id,
        req.hold_days,
        req.instant_limit_usd,
        req.min_amount,
        req.max_amount,
      ]
    );
  return {
    getPurchaseLimitsByClientID,
    createPurchaseLimit,
    updatePurchaseLimit,
    deletePurchaseLimit,
  };
};
export default purchaseLimit;
