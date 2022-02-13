import { DocumentVerification } from "sardine-dashboard-typescript-definitions";
import { Query } from "@google-cloud/datastore";
import { firebaseAdmin } from "../../firebase";
import { DOCUMENT_VERIFICATION_KIND } from "./common";

export const WHITELISTED_FILTERS = [
  "session_key",
  "customer_id",
  "verification_id",
  "client_id",
  "risk_level",
  "forgery_level",
  "image_quality_level",
  "face_match_level",
  "document_match_level",
];

const ds = firebaseAdmin.datastore;

export class DocumentVerficationDS {
  public static async queryById(id: string): Promise<DocumentVerification | null> {
    const query: Query = ds.createQuery(DOCUMENT_VERIFICATION_KIND).filter("verification_id", id);
    const [entities] = await ds.runQuery(query);

    if (entities.length > 0) {
      return entities[0];
    }

    return null;
  }

  public static async queryByFilters(
    filters: Record<string, string>,
    pageCursor: string | undefined = undefined,
    limit: number = 60
  ) {
    let query: Query = ds.createQuery(DOCUMENT_VERIFICATION_KIND);

    for (const p of WHITELISTED_FILTERS) {
      if (filters[p]) {
        query = query.filter(p, filters[p]);
      }
    }

    query = query
      .order("time", {
        descending: true,
      })
      .limit(limit);

    if (pageCursor) {
      query = query.start(pageCursor);
    }

    const [entities, info] = await ds.runQuery(query);

    pageCursor = info.moreResults !== "NO_MORE_RESULTS" ? info.endCursor : undefined;
    return { documentVerifications: entities, pageCursor };
  }
}
