import { Query } from "@google-cloud/datastore";
import { FeedbackKind } from "sardine-dashboard-typescript-definitions";
import { firebaseAdmin } from "../../firebase";
import { FEEDBACK_KIND } from "./common";

const ds = firebaseAdmin.datastore;

export class Feedback {
  public static async getFeedbackList(sessionKey: string): Promise<Array<FeedbackKind>> {
    const dataStoreQuery: Query = ds.createQuery(FEEDBACK_KIND).filter("SessionKey", sessionKey).limit(100);

    const [entities] = await ds.runQuery(dataStoreQuery);
    if (entities.length === 0) {
      return [];
    }

    return entities;
  }
}
