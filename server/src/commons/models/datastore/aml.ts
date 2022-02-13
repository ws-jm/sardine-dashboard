import { Query } from "@google-cloud/datastore";
import { AmlKind } from "sardine-dashboard-typescript-definitions";
import { firebaseAdmin } from "../../firebase";
import { AML_KIND } from "./common";

const ds = firebaseAdmin.datastore;

const SIGNAL_KEY_ID_TO_NAME: { [key: number]: string } = {
  0: "UNKNOWN",
  1: "SANCTION",
  2: "PEP",
  3: "ADVERSE_MEDIA",
};

export class Aml {
  public static async query(clientId: string, customerId: string, sessionKey: string): Promise<AmlKind | null> {
    const dataStoreQuery: Query = ds
      .createQuery(AML_KIND)
      .filter("client_id", clientId)
      .filter("customer_id", customerId)
      .filter("session_id", sessionKey)
      .order("time", { descending: true })
      .limit(1);

    const [entities] = await ds.runQuery(dataStoreQuery);
    if (entities.length === 0) {
      return null;
    }
    const entity: AmlKind = entities[0];
    return { ...entity, signals: entity.signals.map((s) => ({ ...s, name: SIGNAL_KEY_ID_TO_NAME[s.key] })) };
  }
}
