import { Query } from "@google-cloud/datastore";
import moment from "moment";
import { RulePerformanceKind } from "sardine-dashboard-typescript-definitions";
import { firebaseAdmin } from "../../firebase";
import { RULE_PERFORMANCE_KIND } from "./common";

const ds = firebaseAdmin.datastore;

export class RulePerformance {
  static getLastUpdatedTimestamp(): number {
    // Rule performance will get updated every data at 5PM UTC
    const currentHour: number = moment().utc().hour();
    let lastUpdatedDate: number = moment.utc().date();
    if (currentHour < 5) {
      lastUpdatedDate -= 1;
    }
    return moment().utc().set({ date: lastUpdatedDate, hour: 5, minute: 0, second: 0, millisecond: 0 }).unix();
  }

  public static async getLatest(): Promise<Array<RulePerformanceKind>> {
    const query: Query = ds.createQuery(RULE_PERFORMANCE_KIND).filter("Timestamp", ">=", this.getLastUpdatedTimestamp());

    const [entities] = await ds.runQuery(query);
    return entities;
  }
}
