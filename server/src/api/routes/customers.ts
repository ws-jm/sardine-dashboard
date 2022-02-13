import express, { Response } from "express";
import { query, body } from "express-validator";
import { BigQuery } from "@google-cloud/bigquery";
import * as Sentry from "@sentry/node";
import { CustomerRequestBody, AnyTodo, customerUrls } from "sardine-dashboard-typescript-definitions";
import moment from "moment";
import { Session } from "../../commons/models/datastore/sessions";
import { RequestWithUser } from "../request-interface";
import { mw } from "../../commons/middleware";

const {
  getCustomersRoute,
  getBankDetailsRoute,
  getCustomerDetailsRoute,
  profileRoute,
  getCryptoDetailsRoute,
  getCardDetailsRoute,
} = customerUrls.routes;

const router = express.Router();
const bigqueryClient = new BigQuery();
const runQuery = async (queryString: string, params: object) => {
  const options = {
    query: queryString,
    location: "US",
    params,
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const [rows] = await job.getQueryResults();
  return rows;
};

const customerDetailsQuery = `
SELECT
          distinct
          crr.sessionKey as session_key,
          crr.customer_id as user_id_hash,
          crr.client_id,
          crr.txn_id as transaction_id,
          
          crr.txn_amount as transaction_amount,
          crr.txn_currencyCode as transaction_currency_code,
          
          date(customer.created_at) as created_date,
          crr.firstName as first_name,
          crr.lastName as last_name,
          crr.city as city,
          crr.regionCode as region_code,
          crr.postalCode as postal_code,
          crr.countryCode as country_code,

          crr.risk_level, 
          crr.phoneLevel as phone_level,
          crr.emailLevel as email_risk_level,

          crr.phone,
          customer.verification.carrier,
          customer.verification.country_code as phone_country,
          customer.verification.name.name_score,
          customer.verification.address.address_score  ,
          array_to_string(crr.phone_reason_codes, ", ") as phone_reason_codes,
          
          crr.emailAddress as email_address,
          array_to_string(crr.email_reason_codes, ", ") as email_reason_codes,

          customer.emailage_response.risk_band,

          REGEXP_EXTRACT(crr.request_body, r"\\"taxId\\",\\"value\\":\\"([0-9\\._a-zA-Z/\\s]*)\\"") AS taxId,
          
          REGEXP_EXTRACT(crr.response_body, r"\\"behaviorBiometricLevel\\",\\"value\\":\\"([0-9\\._a-zA-Z/\\s]*)\\"") AS behaviorBiometricLevel,
          REGEXP_EXTRACT(crr.response_body, r"\\"taxIdLevel\\",\\"value\\":\\"([0-9\\._a-zA-Z/\\s]*)\\"") AS taxIdLevel,
          REGEXP_EXTRACT(crr.response_body, r"\\"taxIdMatch\\",\\"value\\":\\"([0-9\\._a-zA-Z/\\s]*)\\"") AS taxIdMatch,
          REGEXP_EXTRACT(crr.response_body, r"\\"taxIdStateMatch\\",\\"value\\":\\"([0-9\\._a-zA-Z/\\s]*)\\"") AS taxIdStateMatch,
          REGEXP_EXTRACT(crr.response_body, r"\\"taxIdDOBMatch\\",\\"value\\":\\"([0-9\\._a-zA-Z/\\s]*)\\"") AS taxIdDOBMatch,
          REGEXP_EXTRACT(crr.response_body, r"\\"taxIdNameMatch\\",\\"value\\":\\"([0-9\\._a-zA-Z/\\s]*)\\"") AS taxIdNameMatch,

          array_to_string(crr.behavior_biometric_reason_codes, ", ") as behavior_biometric_reason_codes,
          
          customer.emailage_response.reason as email_reason,
          customer.emailage_response.email.owner_name,
          customer.emailage_response.email.owner_name_match,
          customer.emailage_response.email.location,
          array_to_string(array(SELECT link FROM UNNEST(customer.emailage_response.email.social_media.social_media_links) where source="Facebook"), ", ") as facebook_Link,
          array_to_string(array(SELECT link FROM UNNEST(customer.emailage_response.email.social_media.social_media_links) where source="Twitter"), ", ") as Twitter_Link,
          array_to_string(array(SELECT link FROM UNNEST(customer.emailage_response.email.social_media.social_media_links) where source="LinkedIn"), ", ") as LinkedIn_Link,
          customer.emailage_response.domain.score.reason,
          customer.emailage_response.phone.score.reason as phonescore_reason,
          customer.emailage_response.phone.score.risk_level as email_phone_risk_level,
          customer.emailage_response.bill_address.score.reason as billaddress_reason,
          crr.deviceId as device_id,
          crr.device_ip,

          JSON_EXTRACT_SCALAR(response_body, "$.device.ipLocation.latitude") AS latitude,
          JSON_EXTRACT_SCALAR(response_body, "$.device.ipLocation.longitude") AS longitude,
          
          crr.customer_score,
          crr.street1, 
          crr.street2, 
          crr.dateOfBirth, 
          crr.isEmailVerified, 
          crr.isPhoneVerified, 
          crr.emailDomainLevel,
          crr.customer_risk_level, 
          crr.device_risk_Level,
          crr.browser, 
          crr.os, 
          crr.trueOS, 
          crr.remoteDesktop, 
          crr.emulator, 
          crr.proxy, 
          crr.IpType, 
          crr.vpn,
          date(crr.timestamp) as timestamp,
          crr.timestamp as t

          FROM business.customers as customers, 
          structured_logs.customer_request_responses crr 
`;

const dedupeBySessionKey = (rawResult: AnyTodo[]) => {
  const result: AnyTodo[] = [];
  const knownSession: AnyTodo = {};
  rawResult.forEach((r) => {
    if (!knownSession[r.session_key]) {
      result.push(r);
      knownSession[r.session_key] = true;
    }
  });
  return result;
};

const customersRouter = () => {
  router[getCustomersRoute.httpMethod](
    getCustomersRoute.path,
    [
      query(["clientId"]).exists(),
      body(["startDate", "endDate"]).exists().isString(),
      body(["offset", "limit"]).exists().isNumeric(),
    ],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const clientID: string = req.query.clientId as string;

      const {
        startDate,
        endDate,
        offset,
        limit,
        first_name,
        last_name,
        session_key,
        customer_id,
        phone,
        city,
        postal_code,
        region_code,
        country_code,
        email_address,
        is_email_verified,
        is_phone_verified,
        device_id,
        customer_risk_level,
        device_risk_level,
        device_ip,
        transaction_id,
        risk_level,
        carrier,
        phone_country,
      } = req.body as CustomerRequestBody;

      let result: AnyTodo[];
      let filterCondition = "";
      const params: AnyTodo = {
        clientID,
        startDate,
        endDate,
      };

      if (first_name) {
        filterCondition += ` AND LOWER(crr.firstName)=LOWER(@firstName)`;
        params.firstName = first_name.toLowerCase();
      }

      if (last_name) {
        filterCondition += ` AND LOWER(crr.lastName)=LOWER(@lastName)`;
        params.lastName = last_name.toLowerCase();
      }

      if (session_key) {
        filterCondition += ` AND LOWER(crr.sessionKey)=LOWER(@sessionKey)`;
        params.sessionKey = session_key.toLowerCase();
      }

      if (customer_id) {
        filterCondition += ` AND LOWER(crr.customer_id)=@customerId`;
        params.customerId = customer_id.toLowerCase();
      }

      if (phone) {
        filterCondition += ` AND crr.phone=@phone`;
        params.phone = phone.toLowerCase();
      }

      if (city) {
        filterCondition += ` AND LOWER(crr.city)=@city`;
        params.city = city.toLowerCase();
      }

      if (postal_code) {
        filterCondition += ` AND crr.postalCode=@postalCode`;
        params.postalCode = postal_code.toLowerCase();
      }

      if (region_code) {
        filterCondition += ` AND LOWER(crr.regionCode)=@regionCode`;
        params.regionCode = region_code.toLowerCase();
      }

      if (country_code) {
        filterCondition += ` AND LOWER(crr.countryCode)=@countryCode`;
        params.countryCode = country_code.toLowerCase();
      }

      if (email_address) {
        filterCondition += ` AND LOWER(crr.emailAddress)=LOWER(@emailAddress)`;
        params.emailAddress = email_address.toLowerCase();
      }

      if (is_email_verified) {
        filterCondition += ` AND crr.isEmailVerified=@isEmailVerified`;
        params.isEmailVerified = is_email_verified.toLowerCase();
      }

      if (is_phone_verified) {
        filterCondition += ` AND crr.isPhoneVerified=@isPhoneVerified`;
        params.isPhoneVerified = is_phone_verified.toLowerCase();
      }

      if (device_id) {
        filterCondition += ` AND LOWER(crr.deviceId)=LOWER(@deviceId)`;
        params.deviceId = device_id.toLowerCase();
      }

      if (customer_risk_level) {
        filterCondition += ` AND LOWER(crr.customer_risk_level)=@customerRiskLevel`;
        params.customerRiskLevel = customer_risk_level.toLowerCase();
      }

      if (device_risk_level) {
        filterCondition += ` AND LOWER(crr.device_risk_Level)=@deviceRiskLevel`;
        params.deviceRiskLevel = device_risk_level.toLowerCase();
      }

      if (device_ip) {
        filterCondition += ` AND crr.device_ip=@deviceIp`;
        params.deviceIp = device_ip.toLowerCase();
      }

      if (transaction_id) {
        filterCondition += ` AND LOWER(crr.txn_id)=@transactionId`;
        params.transactionId = transaction_id.toLowerCase();
      }

      if (risk_level) {
        filterCondition += ` AND LOWER(crr.risk_level)=@riskLevel`;
        params.riskLevel = risk_level.toLowerCase();
      }

      if (carrier) {
        filterCondition += ` AND LOWER(customer.verification.carrier)=@carrier`;
        params.carrier = carrier.toLowerCase();
      }

      if (phone_country) {
        filterCondition += ` AND LOWER(phone_country)=@phoneCountry`;
        params.phoneCountry = phone_country.toLowerCase();
      }

      let offsetClause = ` OFFSET ${offset}`;
      try {
        if (filterCondition.split("AND").filter((cond) => !cond.includes("crr.") && cond.trim().length > 0).length === 0) {
          // if filter conditon only contains filter related to crr, let's optimize query here by computing sessionKey
          const queryToGetSessionKey = `-- dashboard, get list of sessionkeys
          SELECT sessionKey, max(timestamp) as t 
            FROM structured_logs.customer_request_responses crr              
            WHERE crr.client_id${clientID.length > 0 ? "=@clientID" : " is not null"} 
            AND crr.timestamp>@startDate 
            AND crr.timestamp<@endDate
            ${filterCondition}
            GROUP BY 1         
            ORDER BY t DESC LIMIT ${limit} OFFSET ${offset}
          `;
          const subparams: AnyTodo = {
            ...params,
          };
          if (clientID.length > 0) {
            subparams.clientID = clientID;
          }

          const subResult = await runQuery(queryToGetSessionKey, subparams);
          const timestamps = subResult.map((r) => r.t.value);
          // optimize query by specifing exact timestamp and sessionKey to scan
          params.endDate = moment.utc(timestamps[0]).add(60, "minutes").format("YYYY-MM-DD HH:mm:ss");
          params.startDate = moment
            .utc(timestamps[timestamps.length - 1])
            .add(-60, "minutes")
            .format("YYYY-MM-DD HH:mm:ss");
          filterCondition = ` AND crr.sessionKey IN UNNEST(@sessionKeys)`;
          params.sessionKeys = subResult.map((r) => r.sessionKey);
          offsetClause = "";
        }
        const queryString = `-- dashboard list query
        ${customerDetailsQuery}
            WHERE crr.client_id${clientID.length > 0 ? "=@clientID" : " is not null"} 
            AND crr.timestamp>@startDate 
            AND crr.timestamp<@endDate
            AND customers.client_id${clientID.length > 0 ? "=@clientID" : " is not null"} 
            AND customers.timestamp>@startDate 
            AND customers.timestamp<@endDate
            ${filterCondition}
            AND crr.sessionKey = customers.session_key
        ORDER BY t DESC LIMIT ${limit} ${offsetClause}`;

        result = await runQuery(queryString, params);

        res.json({ result: dedupeBySessionKey(result) });
      } catch (e) {
        res.json({ result: [], error: e });
        Sentry.addBreadcrumb({ message: "error loading data" });
        Sentry.captureException(e);
      }
    }
  );

  router[getBankDetailsRoute.httpMethod](
    getBankDetailsRoute.path,
    [query(["customerId"]).exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const customerId: string = req.query.customerId as string;
      let result: AnyTodo[];

      const date = moment().subtract(6, "months").format();

      try {
        const query = `WITH cus AS (
          select * from (
              SELECT
                  row_number() over (partition by session_key order by timestamp desc) as seq_num,
               -- bank.account_number,
               transaction_id as trans_id,
               -- bank.routing_number,
               bank.account_type,
               bank.balance,
               bank.balance_currency,
               bank.total_amount_spent,
           FROM business.customers
               WHERE customer.id="${customerId}"
               AND timestamp>'${date}'
              ) where seq_num = 1
          ),
   tran AS (
       select * from 
           (SELECT
               id,
               COALESCE(payment_method.bank.routing_number, payment_method.wire.routing_number, recipient_payment_method.wire.routing_number, recipient_payment_method.bank.routing_number) as routing_number,
               COALESCE(payment_method.bank.account_number, payment_method.wire.account_number, recipient_payment_method.wire.account_number, recipient_payment_method.bank.account_number) as account_number,
               row_number() over (partition by session_key order by created_at_millis desc) as seq_num,
               amount,
               currency_code,
               item_category,
               created_at_millis,
               action_type,
               payment_method.type,
           FROM business.transactions
               WHERE customer_id="${customerId}"
               AND created_at_millis>'${date}'
           ) where seq_num = 1
      )
  SELECT * FROM cus
  inner join tran on tran.id = cus.trans_id
  `;

        result = await runQuery(query, {});
        res.json({ result });
      } catch (e) {
        res.json({ result: [], error: e });
        Sentry.addBreadcrumb({ message: "error loading data" });
        Sentry.captureException(e);
      }
    }
  );

  router[getCardDetailsRoute.httpMethod](
    getCardDetailsRoute.path,
    [query(["customerId"]).exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const customerId: string = req.query.customerId as string;
      let result: AnyTodo[];

      const date = moment().subtract(6, "months").format();

      try {
        const query = `
        WITH cus AS (
          select * from (
              SELECT
               row_number() over (partition by session_key order by timestamp desc) as seq_num,
               transaction_id as trans_id,
               customer.emailage_response.transaction.card_type,
               customer.emailage_response.transaction.issuer_bank,
               customer.emailage_response.transaction.issuer_brand,
               customer.emailage_response.transaction.is_prepaid,
               customer.emailage_response.transaction.card_category,
           FROM business.customers
               WHERE customer.id="${customerId}"
               AND timestamp>'${date}'
              ) where seq_num = 1
          ),
   tran AS (
       select * from 
           (SELECT
              DISTINCT 
               id,
               row_number() over (partition by session_key order by created_at_millis desc) as seq_num,
               payment_method.card.last4,
               payment_method.card.first6,
           FROM business.transactions
               WHERE customer_id="${customerId}"
               AND created_at_millis>'${date}'
               AND payment_method.type='card'
           ) where seq_num = 1
      )
  SELECT * FROM tran
  inner join cus on tran.id = cus.trans_id
        `;

        result = await runQuery(query, {});
        res.json({ result });
      } catch (e) {
        res.json({ result: [], error: e });
        Sentry.addBreadcrumb({ message: "error loading data" });
        Sentry.captureException(e);
      }
    }
  );

  router[getCryptoDetailsRoute.httpMethod](
    getCryptoDetailsRoute.path,
    [query(["customerId"]).exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const customerId: string = req.query.customerId as string;
      let result: AnyTodo[];

      const date = moment().subtract(6, "months").format();

      try {
        const query = `

        SELECT
          * EXCEPT (seq_num)
        FROM (
          SELECT
            DISTINCT recipient_payment_method.crypto.address,
            ROW_NUMBER() OVER (PARTITION BY recipient_payment_method.crypto.address ORDER BY created_at_millis DESC) AS seq_num,
            recipient_payment_method.crypto.currency_code,
            recipient_payment_method.crypto.coinbase_response.result.addressRiskScore,
            recipient_payment_method.crypto.coinbase_response.result.userRiskScore,
            ARRAY_TO_STRING(recipient_payment_method.crypto.coinbase_response.result.metadata.categories,",") AS categories,
          FROM
            business.transactions
          WHERE customer_id="${customerId}"
            AND created_at_millis>'${date}'
            AND recipient_payment_method.type = "crypto")
        WHERE
          seq_num = 1`;
        result = await runQuery(query, {});
        res.json({ result });
      } catch (e) {
        res.json({ result: [], error: e });
        Sentry.addBreadcrumb({ message: "error loading data" });
        Sentry.captureException(e);
      }
    }
  );

  router[getCustomerDetailsRoute.httpMethod](
    getCustomerDetailsRoute.path,
    [query(["customerId"]).exists(), query(["sessionKey"]).exists(), query(["timestamp"]).exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const customerId: string = req.query.customerId as string;
      const sessionKey: string = req.query.sessionKey as string;
      const timestamp: string = req.query.timestamp as string;

      let result: AnyTodo[];
      try {
        const query = `-- dashboard details
        ${customerDetailsQuery}
              WHERE crr.customer_id='${customerId}'
              AND crr.sessionKey = customers.session_key
              AND crr.sessionKey='${sessionKey}'
              And date(crr.timestamp)='${timestamp}'
              LIMIT 1
            `;

        result = await runQuery(query, {});
        res.json({ result });
      } catch (e) {
        res.json({ result: [], error: e });
        Sentry.addBreadcrumb({ message: "error loading data" });
        Sentry.captureException(e);
      }
    }
  );

  router[profileRoute.httpMethod](
    profileRoute.path,
    [query(["customerId"]).exists(), query(["clientId"]).exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const customerId: string = req.query.customerId as string;
      const clientId: string = req.query.clientId as string;
      try {
        const data = await Session.queryByCustomerId(clientId, customerId);
        res.json(data);
      } catch (e) {
        res.json({ result: [], error: e });
        Sentry.addBreadcrumb({ message: "error loading data" });
        Sentry.captureException(e);
      }
    }
  );

  return router;
};

export default customersRouter;
