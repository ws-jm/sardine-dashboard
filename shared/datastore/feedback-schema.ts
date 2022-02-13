type Scope = keyof typeof FEEDBACK_SCOPES;

export interface FeedbackKind {
  Feedback: {
    Time: number;
    Type: string;
    Scope: Scope;
    Processor: string;
    Reason: string;
    Status: string;
    Id: string;
  };
}

export const FEEDBACK_SCOPES = {
  1: "SESSION",
  2: "USER",
} as const;
