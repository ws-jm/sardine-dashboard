import { captureException } from "../../../utils/error-utils";
import { RequestWithUser } from "../../request-interface";
import { db } from "../../../commons/db";

export const writeAuditLog = (req: RequestWithUser, clientID: string, targetId: number, type: string, data: JSON) => {
  const userId = parseInt(req.currentUser?.id || "", 10);
  if (clientID && !Number.isNaN(userId)) {
    db.audit.createLog(clientID, type, targetId, userId, data).catch(captureException);
  } else {
    captureException(`Failed to write audit log for clientID: ${clientID} and userId: ${userId}`);
  }
};
