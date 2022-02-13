import express, { Response } from "express";
import { param, query } from "express-validator";
import {
  documentVerificationsUrls,
  DocumentVerification,
  AnyTodo,
  SARDINE_ADMIN,
  MULTI_ORG_ADMIN,
} from "sardine-dashboard-typescript-definitions";
import { db } from "../../commons/db";
import { mw } from "../../commons/middleware";
import { RequestWithUser } from "../request-interface";
import { WHITELISTED_FILTERS, DocumentVerficationDS } from "../../commons/models/datastore/document-verifications";
import { generateSignedDocumentVerificationImages } from "../utils/routes/document-verifications";
import { handleClientIDNotFoundError } from "../../utils/error-utils";

const router = express.Router();

const { list: listUrl, images: getImagesUrl, details: detailsUrl } = documentVerificationsUrls.routes;
const documentVerificationImages: (keyof DocumentVerification)[] = ["front_image_path", "back_image_path", "selfie_path"];

export const fetchDocumentVerificatonsImages = (documentVerifications: AnyTodo[]) =>
  Promise.all(
    documentVerifications.map((d) => {
      const asynFn = async () => {
        const images = await generateSignedDocumentVerificationImages(d, documentVerificationImages);

        return { ...d, ...images };
      };

      return asynFn();
    })
  );

const documentVerificationsRouter = () => {
  router[detailsUrl.httpMethod](
    detailsUrl.path,
    param("id").isString(),
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser, res: Response): Promise<Response<AnyTodo, Record<string, AnyTodo>> | void> => {
      const data = await DocumentVerficationDS.queryById(req.params.id);
      if (!data) return res.status(404);

      const images = await generateSignedDocumentVerificationImages(data, documentVerificationImages);

      res.json({ ...data, ...images });
      return undefined;
    }
  );

  router[listUrl.httpMethod](
    listUrl.path,
    query("page_cursor").optional().isString(),
    query("client_id").optional().isUUID(),
    query("customer_id").optional().isString(),
    query("verification_id").optional().isString(),
    query("session_key").optional().isString(),
    query("limit").optional().isInt(),
    query("load_image").optional().isBoolean(),
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser, res: Response): Promise<void | Response<AnyTodo, Record<string, AnyTodo>>> => {
      const pageCursor: string | undefined = req.query.page_cursor as string | undefined;

      let clientId = req.query.client_id ? String(req.query.client_id) : undefined;
      try {
        clientId =
          req.currentUser?.user_role === SARDINE_ADMIN || req.currentUser?.user_role === MULTI_ORG_ADMIN
            ? clientId
            : await db.superadmin.getClientId(String(req.currentUser?.organisation));
      } catch (err) {
        return handleClientIDNotFoundError(err as Error, res);
      }

      const limit: number = req.query.limit ? parseInt(req.query.limit as string, 10) : 60;
      const filters: { [key: string]: string } = {};
      WHITELISTED_FILTERS.forEach((filterName) => {
        filters[filterName] = req.query[filterName] as string;
      });

      if (clientId) filters.client_id = clientId;

      const data = await DocumentVerficationDS.queryByFilters(filters, pageCursor, limit);

      if (!req.query.load_image) {
        res.json(data);
        return undefined;
      }

      const documentVerificationsWithImages = await fetchDocumentVerificatonsImages(data.documentVerifications);

      res.json({
        ...data,
        documentVerifications: documentVerificationsWithImages,
      });
      return undefined;
    }
  );
  router[getImagesUrl.httpMethod](
    getImagesUrl.path,
    ...documentVerificationImages.map((image) => query(image).optional().isString()),
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser, res: Response) => {
      const result = await generateSignedDocumentVerificationImages(req.query, documentVerificationImages);

      res.json(result);
    }
  );
  return router;
};

export default documentVerificationsRouter;
