/* eslint-disable @typescript-eslint/naming-convention */
import express, { Response } from "express";
import { query, body } from "express-validator";
import { Datastore } from "@google-cloud/datastore";
import { AnyTodo, AUDIT_LOG_TYPES, queueUrls } from "sardine-dashboard-typescript-definitions";
import { mw } from "../../commons/middleware";
import { db } from "../../commons/db";
import { RequestWithUser } from "../request-interface";
import { firebaseAdmin } from "../../commons/firebase";
import { writeAuditLog } from "../utils/routes/audit";
import { RuleService } from "../../commons/RuleService";
import { CLIENT_ID_FIELD } from "../../utils/constants";

const { getListQueueRoute, addNewQueueRoute, deleteQueueRoute, getListSessionsInQueue, updateQueueRoute } = queueUrls.routes;

const router = express.Router();

const queuesRouter = (ruleService: RuleService) => {
  const ENTITY_NAME = "queues";
  const getEntity = () => firebaseAdmin.datastore.createQuery(ENTITY_NAME);

  router[getListQueueRoute.httpMethod](
    getListQueueRoute.path,
    [query("organisation").exists(), query("checkpoint").optional()],
    mw.requireUserAccess,
    async (req: RequestWithUser, res: Response) => {
      const { organisation = "", checkpoint = "" } = req.query;
      try {
        const clientId = await db.superadmin.getClientId(organisation.toString());

        const users = await db.auth.getOrganizationUsers(organisation.toString());

        const listQuery = getEntity().filter(CLIENT_ID_FIELD, clientId);

        if (checkpoint.toString().length > 0) {
          listQuery.filter("checkpoint", checkpoint.toString());
        }

        const result = await firebaseAdmin.datastore.runQuery(listQuery);
        const data = result[0].map((r: AnyTodo) => {
          const filteredUsers = users.filter((u) => u.id === r.owner_id);
          return {
            ...r,
            id: r[firebaseAdmin.datastore.KEY].id,
            owner: filteredUsers.length > 0 ? filteredUsers[0] : {},
            hits: 0,
          };
        });

        return res.json(data);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
    }
  );

  router[getListSessionsInQueue.httpMethod](
    getListSessionsInQueue.path,
    [query("queueId").exists(), query("page").optional(), query("organisation").exists()],
    mw.requireUserAccess,
    async (req: RequestWithUser, res: Response) => {
      const {
        queueId = "",
        page = "0",
        organisation = "",
        limit = "10",
        status = "",
        session_key = "",
        customer_id = "",
        start_date = "",
        end_date = "",
      } = req.query;
      try {
        const LIMIT = parseInt(limit.toString(), 10) || 10;
        const pageCursor = page !== "start" ? page.toString() : undefined;

        const users = await db.auth.getOrganizationUsers(organisation.toString());
        const clientID = await db.organisation.getClientId(organisation.toString());

        const ds = firebaseAdmin.datastore;

        const key = ds.key([ENTITY_NAME, parseInt(queueId.toString(), 10)]);

        const queueDetails = ds.createQuery(ENTITY_NAME).filter("__key__", key);

        const qData = await ds.runQuery(queueDetails);
        const qOwnerId = qData[0].length > 0 ? qData[0][0].owner_id : "";

        let sessionsQuery = ds.createQuery("session").filter("queue_id", queueId);

        const startTimestampSec = parseInt(start_date as string, 10);
        const endTimestampSec = parseInt(end_date as string, 10);

        if (status) {
          sessionsQuery = sessionsQuery.filter("status", status);
        }

        if (clientID) {
          sessionsQuery = sessionsQuery.filter(CLIENT_ID_FIELD, clientID);
        }

        if (session_key) {
          sessionsQuery = sessionsQuery.filter("session_key", session_key);
        }

        if (customer_id) {
          sessionsQuery = sessionsQuery.filter("customer_id", customer_id);
        }

        if (!Number.isNaN(startTimestampSec)) {
          sessionsQuery = sessionsQuery.filter("timestamp", ">=", startTimestampSec);
        }

        if (!Number.isNaN(endTimestampSec)) {
          sessionsQuery = sessionsQuery.filter("timestamp", "<=", endTimestampSec);
        }

        sessionsQuery = sessionsQuery
          .order("timestamp", {
            descending: true,
          })
          .limit(LIMIT);

        if (pageCursor) {
          sessionsQuery = sessionsQuery.start(pageCursor);
        }

        const [entities, info] = await ds.runQuery(sessionsQuery);

        const list = entities.map((r: AnyTodo) => {
          const filteredUsers = users.filter((u) => (r.owner_id ? u.id === r.owner_id : u.id === qOwnerId));
          return {
            ...r,
            id: r[ds.KEY].id,
            owner: filteredUsers.length > 0 ? filteredUsers[0] : {},
          };
        });

        const data = {
          list,
          isLast: info.moreResults === "NO_MORE_RESULTS",
          newPageCursor: info.moreResults !== "NO_MORE_RESULTS" ? info.endCursor : undefined,
        };

        return res.json(data);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return res.status(404).json({ error: `Sessions not found` });
        }

        return res.status(400).json({ error: `Invalid request` });
      }
    }
  );

  router[addNewQueueRoute.httpMethod](
    addNewQueueRoute.path,
    [body("organisation").exists(), body("name").exists(), body("checkpoint").exists(), body("owner_id").exists()],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { organisation, name, owner_id, checkpoint, jira_enabled } = req.body;

      try {
        const clientId = await db.superadmin.getClientId(organisation.toString());

        const queueKey = firebaseAdmin.datastore.key(ENTITY_NAME);

        const findQuery = getEntity().filter(CLIENT_ID_FIELD, clientId).filter("name", name).limit(1);
        const [entities] = await firebaseAdmin.datastore.runQuery(findQuery);
        if (entities.length > 0) {
          const obj = entities[0];
          return res.json(obj[Datastore.KEY].id || "");
        }

        await firebaseAdmin.datastore.save({
          key: queueKey,
          data: {
            client_id: clientId,
            name,
            owner_id,
            checkpoint,
            jira_enabled: jira_enabled || false,
          },
        });

        const qID = parseInt(queueKey.id || "", 10);
        writeAuditLog(req, clientId, qID, AUDIT_LOG_TYPES.CREATE_QUEUE, req.body);

        return res.json(queueKey.id || "");
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
    }
  );

  router[updateQueueRoute.httpMethod](
    updateQueueRoute.path,
    [
      body("id").exists(),
      body("organisation").exists(),
      body("name").exists(),
      body("checkpoint").exists(),
      body("owner_id").exists(),
    ],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { organisation, id, name, owner_id, checkpoint, jira_enabled } = req.body;

      try {
        const clientId = await db.superadmin.getClientId(organisation.toString());

        const queueKey = firebaseAdmin.datastore.key([ENTITY_NAME, parseInt(id, 10)]);

        await firebaseAdmin.datastore.update({
          key: queueKey,
          data: {
            client_id: clientId,
            name,
            owner_id,
            checkpoint,
            jira_enabled: jira_enabled || false,
          },
        });

        const qID = parseInt(id || "", 10);
        writeAuditLog(req, clientId, qID, AUDIT_LOG_TYPES.UPDATE_QUEUE, req.body);

        return res.json(queueKey.id || "");
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
    }
  );

  router[deleteQueueRoute.httpMethod](
    deleteQueueRoute.path,
    [query("organisation").exists(), query("id").exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const { organisation, id } = req.query;
      if (!id) {
        return res.status(400).json({ error: `Please provide id` });
      }
      const ds = firebaseAdmin.datastore;
      const key = ds.key([ENTITY_NAME, +id]);
      try {
        await ruleService.deleteQueueFromRules(id.toString());
        const result = await ds.delete(key);
        const clientId = await db.superadmin.getClientId(organisation as string);
        const qID = parseInt((id as string) || "", 10);
        writeAuditLog(req, clientId, qID, AUDIT_LOG_TYPES.DELETE_QUEUE, req.body);

        return res.status(200).json(result);
      } catch (e) {
        return res.status(500).json({ error: `Can not remove the queue with queueId = ${id}` });
      }
    }
  );

  return router;
};

export default queuesRouter;
