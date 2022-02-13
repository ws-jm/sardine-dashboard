import { Query } from "@google-cloud/datastore";
import { entity } from "@google-cloud/datastore/build/src/entity";
import { v4 as uuidv4 } from "uuid";
import {
  Transaction,
  SessionKind,
  SessionWithTransactions,
  SessionList,
  CustomerProfileResponse,
} from "sardine-dashboard-typescript-definitions";
import { firebaseAdmin } from "../../firebase";
import { constructCustomerKey, constructSessionKey, SESSION_KIND, TRANSACTION_KIND } from "./common";
import { WebhookRequest, updateCaseStatus } from "../../pubsub/CaseManagement";
import { UpdateSessionRequest } from "../../../api/request-interface";
import { DocumentVerficationDS } from "./document-verifications";
import { fetchDocumentVerificatonsImages } from "../../../api/routes/document-verifications";

const ds = firebaseAdmin.datastore;

const DATA_TYPES = {
  STRING: "string",
  INT: "int",
} as const;

type DataType = typeof DATA_TYPES[keyof typeof DATA_TYPES];

interface NestedFieldsProps {
  key: string;
  field: string;
  dataType: DataType;
}

const WHITELISTED_NESTED_FILTERS: NestedFieldsProps[] = [
  {
    key: "customer_risk_level",
    field: "checkpointOutput.customer_risk_level",
    dataType: DATA_TYPES.STRING,
  },
  {
    key: "rule_id",
    field: "checkpointOutput.rule_executed",
    dataType: DATA_TYPES.INT,
  },
];

const WHITELISTED_FILTERS = [
  "session_key",
  "customer_id",
  "transaction_id",
  "flow",
  "first_name",
  "last_name",
  "email_address",
  "phone",
  "country_code",
  "device_id",
  "phone_level",
  "email_level",
  "tax_id_level",
  "adverse_media_level",
  "pep_level",
  "sanction_level",
] as const;

export class Session {
  public static getKey(clientId: string, customerId: string, sessionKey: string): entity.Key {
    return ds.key(["customer", constructCustomerKey(clientId, customerId), "session", constructSessionKey(clientId, sessionKey)]);
  }

  public static async findbyKey(clientId: string, customerId: string, sessionKey: string): Promise<SessionKind | null> {
    const key = this.getKey(clientId, customerId, sessionKey);
    const dataStoreQuery: Query = ds.createQuery(SESSION_KIND);

    if (customerId.length === 0) {
      dataStoreQuery.filter("session_key", sessionKey).filter("client_id", clientId);
    } else {
      dataStoreQuery.filter("__key__", key);
    }

    dataStoreQuery.limit(1);

    const [entities] = await ds.runQuery(dataStoreQuery);
    if (entities.length === 0) {
      return null;
    }
    return entities[0];
  }

  public static async getTransactionsList(clientId: string, customerId: string, sessionKey: string): Promise<Array<Transaction>> {
    const dataStoreQuery: Query = ds
      .createQuery(TRANSACTION_KIND)
      .filter("client_id", clientId)
      .filter("customer_id", customerId)
      .filter("session_key", sessionKey)
      .limit(100);

    const [entities] = await ds.runQuery(dataStoreQuery);
    return entities || [];
  }

  public static async getSessionWithTransactions(
    clientId: string,
    customerId: string,
    sessionKey: string
  ): Promise<SessionWithTransactions> {
    const session = await this.findbyKey(clientId, customerId, sessionKey);
    const transactions = await this.getTransactionsList(clientId, customerId, sessionKey);
    return { session, transactions };
  }

  public static async update(d: UpdateSessionRequest): Promise<boolean> {
    const transaction = ds.transaction();
    try {
      const key = this.getKey(d.clientId, d.customerId, d.sessionKey);
      await transaction.run();
      const session = await this.findbyKey(d.clientId, d.customerId, d.sessionKey);
      const entityData = {
        key,
        data: {
          ...session,
          ...d.updated_data,
        },
      };
      transaction.update(entityData);
      await transaction.commit();

      const data: WebhookRequest = {
        data: {
          id: uuidv4(),
          type: "case.status_updated",
          data: {
            action: {
              source: "dashboard",
              user_email: d.owner,
              value: d.updated_data.decision || "",
            },
            case: {
              sessionKey: d.sessionKey,
              customerID: d.customerId,
              status: d.updated_data.status || "",
              transactionID: d.transactionID,
            },
            queue: {
              name: d.queueName,
              checkpoint: d.checkpoint,
            },
          },
          timestamp: new Date().toUTCString(),
        },
        clientId: d.clientId,
      };

      await updateCaseStatus(data);

      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  public static async queryByTimeRange(
    clientId: string,
    startTimestamp: number,
    endTimestamp: number,
    filters: { [key: string]: string },
    pageCursor: string | undefined = undefined,
    limit: number = 10
  ): Promise<SessionList> {
    let query: Query = ds
      .createQuery(SESSION_KIND)
      .filter("client_id", "=", clientId)
      .filter("timestamp", ">=", startTimestamp)
      .filter("timestamp", "<=", endTimestamp);

    WHITELISTED_FILTERS.forEach((p) => {
      if (filters[p]) {
        query = query.filter(p, filters[p]);
      }
    });

    WHITELISTED_NESTED_FILTERS.forEach((p) => {
      if (filters[p.key]) {
        const value = p.dataType === DATA_TYPES.INT ? parseInt(filters[p.key], 10) : filters[p.key];
        query = query.filter(p.field, value);
      }
    });

    query = query
      .order("timestamp", {
        descending: true,
      })
      .limit(limit);

    if (pageCursor) {
      query = query.start(pageCursor);
    }

    const [entities, info] = await ds.runQuery(query);
    const newPageCursor = info.moreResults !== "NO_MORE_RESULTS" ? info.endCursor : undefined;
    return { sessions: entities, pageCursor: newPageCursor };
  }

  public static async queryByCustomerId(
    clientId: string,
    customerId: string,
    limit: number = 10
  ): Promise<CustomerProfileResponse> {
    const query: Query = ds
      .createQuery(SESSION_KIND)
      .filter("client_id", clientId)
      .filter("customer_id", customerId)
      .order("timestamp", { descending: true }); // Order by timestamp descending. New session comes first.
    const transactionQuery: Query = ds
      .createQuery(TRANSACTION_KIND)
      .filter("client_id", clientId)
      .filter("customer_id", customerId)
      .limit(limit);

    const filters = {
      client_id: clientId,
      customer_id: customerId,
    };

    const { documentVerifications } = await DocumentVerficationDS.queryByFilters(filters);

    const documentVerificationsWithImages = await fetchDocumentVerificatonsImages(documentVerifications);

    const sessions = await ds.runQuery(query);
    const [transactions, info] = await ds.runQuery(transactionQuery);
    const newPageCursor = info.moreResults !== "NO_MORE_RESULTS" ? info.endCursor : undefined;

    return {
      sessions: sessions[0],
      transactions: { transactions, pageCursor: newPageCursor },
      documentVerifications: documentVerificationsWithImages,
    };
  }
}
