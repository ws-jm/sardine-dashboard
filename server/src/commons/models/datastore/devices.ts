import { Query } from "@google-cloud/datastore";
import { entity } from "@google-cloud/datastore/build/src/entity";
import { DeviceKind, DEVICE_WHITELISTED_FILTERS, UserAggregationKind } from "sardine-dashboard-typescript-definitions";
import { firebaseAdmin } from "../../firebase";
import { constructCustomerKey, constructDeviceKey, DEVICES_KIND, USER_AGGREGATIONS_KIND } from "./common";

const ds = firebaseAdmin.datastore;

export class Devices {
  public static getKey(clientId: string, sessionKey: string, deviceId: string): entity.Key {
    return ds.key(["device_session_profile", constructDeviceKey(clientId, sessionKey, deviceId)]);
  }

  public static getCustomerKey(clientId: string, customerId: string): entity.Key {
    return ds.key(["user_aggregations_multiday", constructCustomerKey(clientId, customerId)]);
  }

  public static async findbyKey(clientId: string, deviceId: string, sessionKey: string): Promise<DeviceKind | null> {
    const key = this.getKey(clientId, sessionKey, deviceId);
    const dataStoreQuery: Query = ds.createQuery(DEVICES_KIND);

    if (deviceId.length === 0) {
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

  public static async getDeviceDetails(clientId: string, sessionKey: string): Promise<DeviceKind | null> {
    const dataStoreQuery: Query = ds
      .createQuery(DEVICES_KIND)
      .filter("client_id", clientId)
      .filter("session_key", sessionKey)
      .limit(1)
      .order("timestamp", {
        descending: true,
      });

    const [entities] = await ds.runQuery(dataStoreQuery);
    return entities.length > 0 ? entities[0] : null;
  }

  public static async getUserAggregation(clientId: string, customerId: string): Promise<UserAggregationKind | null> {
    const key = this.getCustomerKey(clientId, customerId);
    const dataStoreQuery: Query = ds.createQuery(USER_AGGREGATIONS_KIND).filter("__key__", key);
    dataStoreQuery.limit(1);

    const [entities] = await ds.runQuery(dataStoreQuery);
    if (entities.length === 0) {
      return null;
    }
    return entities[0];
  }

  public static async queryByTimeRange(
    clientId: string,
    startTimestampSeconds: number,
    endTimestampSeconds: number,
    filters: { [key: string]: string },
    offset: number = 0,
    limit: number = 10
  ): Promise<Array<DeviceKind>> {
    let query: Query = ds
      .createQuery(DEVICES_KIND)
      .filter("client_id", "=", clientId)
      .filter("timestamp", ">=", startTimestampSeconds * 1000)
      .filter("timestamp", "<=", endTimestampSeconds * 1000);

    DEVICE_WHITELISTED_FILTERS.forEach((p: string) => {
      if (filters[p]) {
        query = query.filter(p, filters[p]);
      }
    });

    query = query
      .order("timestamp", {
        descending: true,
      })
      .offset(offset)
      .limit(limit);

    const [entities] = await ds.runQuery(query);
    return entities;
  }
}
