import { SessionKind } from "sardine-dashboard-typescript-definitions";

export default interface SessionListResponse {
  sessions: Array<SessionKind>;
  pageCursor: string;
}
