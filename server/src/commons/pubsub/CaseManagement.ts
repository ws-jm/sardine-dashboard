import { PubSub } from "@google-cloud/pubsub";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import * as Sentry from "@sentry/node";

const CM_TOPIC_NAME = "webhooks";

export interface WebhookRequest {
  data: CaseStatusData;
  clientId: string;
}

interface CaseStatusData {
  id: string;
  type: string;
  timestamp: string;
  data: CaseData;
}

interface CaseData {
  action: CaseAction;
  case: CaseInfo;
  queue: QueueDate;
}

interface CaseAction {
  source: string;
  user_email: string;
  value: string;
}

interface CaseInfo {
  sessionKey: string;
  customerID: string;
  status: string;
  transactionID: string;
}

interface QueueDate {
  name: string;
  checkpoint: string;
}

export async function updateCaseStatus(session: WebhookRequest) {
  try {
    // Instantiates a client
    const pubsub = new PubSub({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });

    // Instance of the topic
    const topic = pubsub.topic(CM_TOPIC_NAME);

    // Connect to subscription on topic
    const subscription = topic.subscription(`webhook-subscription`);

    // Receive callbacks for errors on the subscription
    subscription.on("error", (error: AnyTodo) => {
      console.error("Received error:", error);
      Sentry.captureException(error);
    });

    // Send a message to the topic
    await topic.publish(Buffer.from(JSON.stringify({ ...session, type: "casemanagement" })));
  } catch (error) {
    Sentry.captureException(error);
  }
}
