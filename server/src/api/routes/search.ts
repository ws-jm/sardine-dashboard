import express, { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import {
  UserAggregationsRequestBody,
  SearchDetailsRequestBody,
  searchUrls,
  AnyTodo,
  DATA_SOURCE,
  FetchDeviceProfileRequestBody,
  convertDeviceKindToProfile,
} from "sardine-dashboard-typescript-definitions";
import moment from "moment";
import { mw } from "../../commons/middleware";
import { db } from "../../commons/db";
import { captureException } from "../../utils/error-utils";
import { loadEsClient } from "../search/esClient";
import { Devices } from "../../commons/models/datastore/devices";
import { DATE_FORMATS } from "../../utils/constants";
import { RequestWithUser, RequestWithCurrentUser } from "../request-interface";

const router = express.Router();
const { healthCheckRoute, getDeviceProfileRoute, getDeviceDetailsRoute, getUserAggregationsRoute } = searchUrls.routes;

const esPromise = loadEsClient();

interface DeviceQueryFilters {
  range?: {
    datetime: {
      gte: string;
      lte: string;
    };
  };
  term?: AnyTodo;
}

const searchRouter = () => {
  router[healthCheckRoute.httpMethod](healthCheckRoute.path, (_req: Request, res: Response) => res.send("OK"));

  router[getDeviceProfileRoute.httpMethod](
    getDeviceProfileRoute.path,
    [body("organisation").exists().isString(), body("sessionKey").exists().isString()],
    mw.validateRequest,
    mw.requireOrganisationAccess,
    async (req: RequestWithCurrentUser<FetchDeviceProfileRequestBody>, res: Response, _next: NextFunction) => {
      const esClient = await esPromise;
      const { sessionKey, organisation, source, clientId } = req.body;

      const client_id = clientId || (await db.organisation.getClientId(organisation));

      if (source === DATA_SOURCE.DATASTORE) {
        try {
          const response = await Devices.getDeviceDetails(client_id || "", sessionKey);

          if (response) {
            return res.json({
              result: {
                profile: convertDeviceKindToProfile(response),
              },
            });
          }
        } catch (error) {
          captureException(error);
          return res.status(400).json({ error: "DS_QUERY_ERROR" });
        }
      }

      const filters: DeviceQueryFilters[] = [
        ...(client_id
          ? [
              {
                term: {
                  client_id,
                },
              },
            ]
          : []),
        ...(sessionKey
          ? [
              {
                term: {
                  session_key: sessionKey,
                },
              },
            ]
          : []),
      ];

      const searchQuery = {
        query: {
          bool: {
            filter: filters,
          },
        },
      };

      try {
        const response = await esClient.search({
          index: "device-profile-session",
          body: searchQuery,
        });
        if (response.statusCode === 200) {
          return res.json({ result: response.body });
        }
        return res.status(400).json({ error: "ES_QUERY_ERROR" });
      } catch (e) {
        return res.status(400).json({ error: "ES_QUERY_ERROR" });
      }
    }
  );

  router[getDeviceDetailsRoute.httpMethod](
    getDeviceDetailsRoute.path,
    [
      body("startTimestampSeconds").exists().isInt(),
      body("endTimestampSeconds").exists().isInt(),
      body("organisation").exists().isString(),
      body("source").exists().isString(),
      body("offset").exists().isInt(),
      body("limit").exists().isInt(),
    ],
    mw.validateRequest,
    mw.requireOrganisationAccess,
    async (req: RequestWithUser<SearchDetailsRequestBody>, res: Response, _next: NextFunction) => {
      const esClient = await esPromise;
      const { startTimestampSeconds, endTimestampSeconds, organisation, source, offset, limit, filters } = req.body;

      const client_id = (await db.organisation.getClientId(organisation)) || "";
      const f: { [key: string]: string } = filters || {};

      if (source === DATA_SOURCE.DATASTORE) {
        try {
          const response = await Devices.queryByTimeRange(
            client_id,
            startTimestampSeconds,
            endTimestampSeconds,
            f,
            offset,
            limit
          );
          return res.json({ result: response.map((r) => convertDeviceKindToProfile(r)) });
        } catch (error) {
          captureException(error);
          return res.status(400).json({ error: "DS_QUERY_ERROR" });
        }
      }

      let _fils: string[] = [];
      const filterKeys = Object.keys(f);
      if (filterKeys.length > 0) {
        _fils = filterKeys.map((key: string) => `{ "term": { "${key}": "${f[key]}" }}`);
      }

      const _filters: DeviceQueryFilters[] = [
        ...(client_id
          ? [
              {
                term: {
                  client_id,
                },
              },
            ]
          : []),
        ...(filterKeys.length > 0 ? _fils.map((f: AnyTodo) => JSON.parse(f)) : []),
      ];

      if (startTimestampSeconds !== null && endTimestampSeconds !== null) {
        _filters.push({
          range: {
            datetime: {
              gte: moment(startTimestampSeconds * 1000).format(DATE_FORMATS.DATETIME),
              lte: moment(endTimestampSeconds * 1000).format(DATE_FORMATS.DATETIME),
            },
          },
        });
      }

      const searchQuery = {
        query: {
          bool: {
            filter: _filters,
          },
        },
        from: offset,
        size: limit,
        sort: [
          {
            datetime: "desc",
          },
        ],
      };

      try {
        const response = await esClient.search({
          index: "device-profile-session",
          body: searchQuery,
        });
        if (response.statusCode === 200) {
          return res.json({ result: response.body });
        }
        return res.status(400).json({ error: "ES_QUERY_ERROR" });
      } catch (e) {
        captureException(e);
        return res.status(400).json({ error: "ES_QUERY_ERROR" });
      }
    }
  );

  router[getUserAggregationsRoute.httpMethod](
    getUserAggregationsRoute.path,
    [body("organisation").exists().isString(), body("userId").exists().isString()],
    mw.validateRequest,
    mw.requireOrganisationAccess,
    async (req: RequestWithUser<UserAggregationsRequestBody>, res: Response, _next: NextFunction) => {
      const { organisation, userId, clientId } = req.body;

      const client_id = clientId || (await db.organisation.getClientId(organisation)) || "";
      try {
        const response = await Devices.getUserAggregation(client_id, userId);
        return res.json({ result: response });
      } catch (e) {
        captureException(e);
        return res.status(400).json({ error: "DS_QUERY_ERROR" });
      }
    }
  );

  return router;
};

export default searchRouter;
