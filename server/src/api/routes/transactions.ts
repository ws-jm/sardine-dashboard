import express, { Response } from "express";
import { body, query } from "express-validator";
import moment from "moment";
import { Transaction, TransactionsRequestBody, transactionUrls } from "sardine-dashboard-typescript-definitions";
import { captureException } from "../../utils/error-utils";
import { mw } from "../../commons/middleware";
import { db } from "../../commons/db";
import { RequestWithUser } from "../request-interface";
import { firebaseAdmin } from "../../commons/firebase";

const { getTransactionDetailsRoute, getTransactionsRoute } = transactionUrls.routes;

const router = express.Router();

const transactionsRouter = () => {
  const ENTITY_NAME = "transaction";
  const getEntity = () => firebaseAdmin.datastore.createQuery(ENTITY_NAME);

  const loadTransactions = async (clientId: string, limit: number, filters: TransactionsRequestBody) => {
    const {
      startDate,
      endDate,
      customer_id,
      action_type,
      item_category,
      session_key,
      user_risk_level,
      transaction_id,
      crypto_address,
      card_hash,
      account_number,
      offset,
    } = filters;
    const dsQuery = getEntity().filter("client_id", clientId.toString());

    if (startDate) dsQuery.filter("created_milli", ">=", moment(startDate).unix() * 1000);
    if (endDate) dsQuery.filter("created_milli", "<=", moment(endDate).unix() * 1000);
    if (customer_id) dsQuery.filter("customer_id", customer_id);
    if (action_type) dsQuery.filter("action_type", action_type);
    if (item_category) dsQuery.filter("item_category", item_category);
    if (session_key) dsQuery.filter("session_key", session_key);
    if (transaction_id) dsQuery.filter("transaction_id", transaction_id);
    if (user_risk_level) dsQuery.filter("user_risk_level", user_risk_level);
    if (crypto_address) dsQuery.filter("crypto_address", crypto_address);
    if (card_hash) dsQuery.filter("card_hash", card_hash);
    if (account_number) dsQuery.filter("account_number", account_number);
    if (offset) dsQuery.offset(offset);

    if (limit > 0) dsQuery.limit(limit);

    const [entities, info] = await firebaseAdmin.datastore.runQuery(dsQuery);
    const islast = info.moreResults === "NO_MORE_RESULTS";

    return { transactions: entities, islast };
  };

  router[getTransactionsRoute.httpMethod](
    getTransactionsRoute.path,
    [query("organisation").exists()],
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser<TransactionsRequestBody>, res: Response) => {
      const { organisation = "" } = req.query;
      try {
        const clientId =
          req.currentUser?.user_role === "sardine_admin"
            ? await db.superadmin.getClientId(organisation.toString())
            : await db.superadmin.getClientId(req.currentUser?.organisation || "");

        const result = await loadTransactions(clientId, 60, req.body);
        return res.json(result);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return res.status(404).json({ error: `Transactions not found` });
        }

        return res.status(500).json({ error: `Internal server error` });
      }
    }
  );

  router[getTransactionDetailsRoute.httpMethod](
    getTransactionDetailsRoute.path,
    [query("clientId").exists(), body("transaction_id").exists()],
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser, res: Response) => {
      const { clientId = "" } = req.query;
      const { transaction_id, load_transactions, startDate, endDate } = req.body;

      try {
        const dsQuery = getEntity().filter("client_id", clientId.toString()).filter("id", transaction_id.toString()).limit(1);

        const [entities] = await firebaseAdmin.datastore.runQuery(dsQuery);
        const transactionData = entities.length > 0 ? entities[0] : null;
        let transactionsList: Transaction[] = [];
        if (transactionData && load_transactions) {
          const pType = transactionData.payment_method;
          const card_hash = pType === "card" ? transactionData.card_hash : undefined;
          const accountNumber = pType === "bank" ? transactionData.account_number : undefined;
          const cryptoAddress = pType === "crypto" ? transactionData.crypto_address : undefined;

          const { transactions } = await loadTransactions(clientId.toString(), 100, {
            card_hash,
            account_number: accountNumber,
            crypto_address: cryptoAddress,
            customer_id: transactionData.customer_id,
            startDate,
            endDate,
            offset: 0,
          });

          transactionsList = transactions;
        }

        return res.json({ data: transactionData, transactions: transactionsList });
      } catch (e: unknown) {
        captureException(e);
        return res.status(404).json({ error: `Failed to load transaction details` });
      }
    }
  );

  return router;
};

export default transactionsRouter;
