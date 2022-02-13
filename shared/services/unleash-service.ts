import { AnyTodo } from "..";

export interface Constraint {
  values: string[];
  operator: string;
  contextName: string;
}

export interface Parameters {
  userIds: string;
  groupId: string;
  rollout?: number;
  stickiness: string;
  percentage?: number;
}

export interface Strategy {
  name: string;
  constraints: Constraint[];
  parameters: Parameters;
  id: string;
}

export interface FeatureFlag {
  strategies: Strategy[];
  enabled: boolean;
  name: string;
  description: string;
  project: string;
  stale: boolean;
  type: string;
  variants: AnyTodo[];
  lastSeenAt?: string;
  createdAt: string;
}

export interface GetFeatureFlagsResponse {
  version: number;
  features: FeatureFlag[];
}
