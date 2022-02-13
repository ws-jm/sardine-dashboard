import { OwnerProps } from "sardine-dashboard-typescript-definitions";

export interface QueueProps {
  id: number;
  name?: string;
  owner: OwnerProps;
  hits?: number;
  sessionKey?: string;
  userIdHash?: string;
  timestamp?: string;
  status?: string;
  client_id: string;
  checkpoint: string;
}
