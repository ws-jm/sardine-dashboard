import { Grid } from "@material-ui/core";
import { uniqBy } from "lodash-es";
import { Transaction } from "sardine-dashboard-typescript-definitions";
import { Link } from "components/Common/Links";
import american_express from "../../../utils/logo/cards/american_express.svg";
import diners_club from "../../../utils/logo/cards/diners_club.svg";
import discover from "../../../utils/logo/cards/discover.svg";
import elo from "../../../utils/logo/cards/elo.svg";
import hiper from "../../../utils/logo/cards/hiper.svg";
import jcb from "../../../utils/logo/cards/jcb.png";
import laser from "../../../utils/logo/cards/laser.png";
import maestro from "../../../utils/logo/cards/maestro.svg";
import mastercard from "../../../utils/logo/cards/mastercard.svg";
import troy from "../../../utils/logo/cards/troy.png";
import unionpay from "../../../utils/logo/cards/unionpay.svg";
import visa from "../../../utils/logo/cards/visa.svg";
import { Cell, StyledTr, StyledTable, StyledTh } from "../styles";
import { DATE_FORMATS, TIME_UNITS } from "../../../constants";
import { formatTimestampInUtc } from "../../../utils/timeUtils";

export interface BankObject {
  account_number: string;
  routing_number: string;
  account_type: string;
  balance: string;
  balance_currency: string;
  total_amount_spent: string;
}

export interface CardObject {
  card_type: string;
  issuer_brand: string;
  issuer_icon?: string;
  is_prepaid: string;
  card_category: string;
  last4: string;
  first6: string;
  isRelevantToSession: boolean;
}

export interface CryptoObject {
  addressRiskScore: string;
  userRiskScore: string;
  categories: string;
  currency_code: string;
  address: string;
}

export interface TransactionObject {
  amount: string;
  currency_code: string;
  item_category: string;
  created_at_millis: string;
  action_type: string;
  type: string;
  isRelevantToSession: boolean;
}

export function getDeviceViewLink(session_id: string | undefined): JSX.Element | string {
  if (session_id === "" || session_id === undefined) {
    return "-";
  }
  return (
    <Link href={`/device-view?session=${encodeURIComponent(session_id)}`} rel="noreferrer" target="_blank">
      {session_id}
    </Link>
  );
}

export const buildTransactionObject = (transaction: Transaction, sessionTransactionId: string): TransactionObject => ({
  amount: String(transaction.amount) || "",
  currency_code: transaction.currency_code || "",
  item_category: transaction.item_category || "-",
  created_at_millis: transaction.created_milli
    ? formatTimestampInUtc(transaction.created_milli, { format: DATE_FORMATS.DATETIME, unit: TIME_UNITS.MILLISECOND })
    : "",
  action_type: transaction.action_type || "",
  type: transaction.payment_method || "",
  isRelevantToSession: sessionTransactionId.length === 0 ? true : transaction.id === sessionTransactionId,
});

export const buildCardObject = (transaction: Transaction, sessionTransactionId: string): CardObject => ({
  card_type: "",
  issuer_brand: "",
  is_prepaid: "",
  card_category: "",
  last4: transaction.last_4,
  first6: transaction.first_6,
  isRelevantToSession: sessionTransactionId.length === 0 ? true : transaction.id === sessionTransactionId,
});

export const BANK_ACCOUNT_TYPE = {
  0: "UNKNOWN",
  1: "CHECKING",
  2: "SAVING",
  3: "OTHER",
} as const;

export const buildBankObject = (transaction: Transaction): BankObject => ({
  account_number: transaction.account_number,
  routing_number: transaction.routing_number,
  account_type: BANK_ACCOUNT_TYPE[transaction.account_type],
  balance: "",
  balance_currency: "",
  total_amount_spent: "",
});

export const dedupeCryptoObjects = (cryptoObjects: CryptoObject[]): CryptoObject[] =>
  uniqBy(cryptoObjects, ({ currency_code, address, addressRiskScore, userRiskScore, categories }) =>
    [currency_code, address, addressRiskScore, userRiskScore, categories].join()
  );

export const dedupeBankObjects = (bankObjects: BankObject[]): BankObject[] =>
  uniqBy(bankObjects, ({ account_number, routing_number, account_type, balance, balance_currency, total_amount_spent }) =>
    [account_number, routing_number, account_type, balance, balance_currency, total_amount_spent].join()
  );

export const dedupeCardObjects = (cardObjects: CardObject[]): CardObject[] =>
  uniqBy(cardObjects, ({ card_category, card_type, first6, last4, issuer_brand, is_prepaid }) =>
    [card_category, card_type, first6, last4, issuer_brand, is_prepaid].join()
  );

export const buildCryptoObject = (transaction: Transaction): CryptoObject[] => {
  const output = [];
  if (transaction.crypto_address !== undefined) {
    output.push({
      addressRiskScore: transaction.address_risk_level || "-",
      userRiskScore: transaction.user_risk_level || "-",
      categories: transaction.categories || "-",
      currency_code: transaction.crypto_currency_code || "-",
      address: transaction.crypto_address,
    });
  }
  if (transaction.recipient_payment_method_crypto !== undefined) {
    output.push({
      addressRiskScore: transaction.recipient_payment_method_crypto?.address_risk_level || "-",
      userRiskScore: transaction.recipient_payment_method_crypto?.user_risk_level || "-",
      categories: transaction.recipient_payment_method_crypto?.categories || "-",
      currency_code: transaction.recipient_payment_method_crypto?.currency_code || "-",
      address: transaction.recipient_payment_method_crypto?.crypto_address,
    });
  }

  return output;
};

export const renderSessionNotFound = (sessionKey: string): JSX.Element => (
  <Grid container justify="center">
    {`No record found for Session: ${sessionKey}.`}
  </Grid>
);

export const TableBodyTransactions = ({ t }: { t: TransactionObject }): JSX.Element => (
  <tbody id="table_transactions_body">
    <StyledTr isHighlight={t.isRelevantToSession}>
      <Cell>{`${t.currency_code} ${t.amount}`}</Cell>
      <Cell>{`${t.type}`}</Cell>
      <Cell>{`${t.item_category}`}</Cell>
      <Cell>{`${t.created_at_millis}`}</Cell>
      <Cell>{`${t.action_type}`}</Cell>
    </StyledTr>
  </tbody>
);

export const TableBodyBank = ({ b }: { b: BankObject }): JSX.Element => (
  <tbody id="table_bank_body">
    <StyledTr>
      <Cell>{`${b.account_number}`}</Cell>
      <Cell>{`${b.routing_number}`}</Cell>
      <Cell>{`${b.account_type}`}</Cell>
      <Cell>{`${b.balance} ${b.balance_currency}`}</Cell>
      <Cell>{`${b.balance_currency} ${b.total_amount_spent}`}</Cell>
    </StyledTr>
  </tbody>
);

export const TableBodyCrypto = ({ c }: { c: CryptoObject }): JSX.Element => {
  let link: JSX.Element | string = "-";
  let providerLink: JSX.Element | string = "-";
  if (c.currency_code && c.currency_code.toLowerCase() !== "") {
    link = (
      <Link
        id="coinbase_address_link"
        target="_blank"
        href={`https://app.analytics.coinbase.com/${c.currency_code.toLowerCase()}/addresses/${c.address}`}
      >
        LINK
      </Link>
    );

    providerLink = (
      <Link
        id="provider_link"
        target="_blank"
        href={`https://www.blockchain.com/${c.currency_code.toLowerCase()}/address/${c.address}`}
      >
        LINK
      </Link>
    );
  }
  return (
    <tbody id="table_crypto_body">
      <StyledTr>
        <Cell>{`${c.currency_code}`}</Cell>
        <Cell>{`${c.address}`}</Cell>
        <Cell>{`${c.addressRiskScore}`}</Cell>
        <Cell>{`${c.userRiskScore}`}</Cell>
        <Cell>{`${c.categories}`}</Cell>
        <Cell>{link}</Cell>
        <Cell>{providerLink}</Cell>
      </StyledTr>
    </tbody>
  );
};
export const TableBodyOther = ({ c }: { c: CardObject }): JSX.Element => (
  <tbody id="table_other_body">
    <StyledTr isHighlight={c.isRelevantToSession}>
      <Cell>{`${c.card_type}`}</Cell>
      <Cell>{`${c.first6}••••••${c.last4}`}</Cell>
      <Cell>{c.issuer_icon ? <img alt="" src={c.issuer_icon} style={{ height: 13 }} /> : `${c.issuer_brand}`}</Cell>
      <Cell>{`${c.is_prepaid}`}</Cell>
      <Cell>{`${c.card_category}`}</Cell>
    </StyledTr>
  </tbody>
);

export const DivNoDataAvailable = (): JSX.Element => (
  <div
    id="no_data_message"
    style={{
      textAlign: "center",
      fontSize: 14,
      fontWeight: "bold",
      color: "grey",
    }}
  >
    {" "}
    No data available!{" "}
  </div>
);

export const KEY_CUSTOMER_DETAILS = "Customer Details" as const;
export const KEY_TAX_ID_DETAILS = "Tax ID Details" as const;
export const KEY_AML_ANTI_MONEY_LAUNDERING = "AML (Anti Money Laundering)" as const;
export const KEY_IDENTITY = "Identity" as const;
export const KEY_DEVICE_AND_BEHAVIOUR_DETAILS = "Device and Behaviour Details" as const;
export const KEY_CARD_DETAILS = "Card Details" as const;
export const KEY_BANK_DETAILS = "Bank Details" as const;
export const KEY_TRANSACTIONS = "Transactions" as const;
export const KEY_CRYPTO_ADDRESSES = "Crypto Addresses" as const;

export const CARD_KEYS_WITH_HEADERS = [KEY_TRANSACTIONS, KEY_CRYPTO_ADDRESSES, KEY_CARD_DETAILS, KEY_BANK_DETAILS];

export type CardNameWithHeaders = typeof CARD_KEYS_WITH_HEADERS[number];

export const CARD_HEADERS: { [name in CardNameWithHeaders]: string[] } = {
  [KEY_TRANSACTIONS]: ["AMOUNT", "PAYMENT MODE", "ITEM CATEGORY", "DATE", "ACTION TYPE"],
  [KEY_CRYPTO_ADDRESSES]: [
    "CURRENCY CODE",
    "ADDRESS",
    "ADDRESS RISK LEVEL",
    "USER RISK LEVEL",
    "ADDRESS CATEGORIES",
    "COINBASE DASHBOARD",
    "ADDRESS DETAILS",
  ],
  [KEY_CARD_DETAILS]: ["TYPE", "NUMBER", "ISSUER", "IS PREPAID", "CATEGORY"],
  [KEY_BANK_DETAILS]: ["ACCOUNT NUMBER", "ROUTING NUMBER", "ACCOUNT TYPE", "BALANCE", "TOTAL SPENT"],
};

export const CardContentFilled = ({
  name,
  tableBodyElements,
}: {
  name: CardNameWithHeaders;
  tableBodyElements: JSX.Element[];
}): JSX.Element => (
  <StyledTable>
    <thead>
      <tr
        style={{
          height: "36px",
          backgroundColor: "#f5f5f5",
        }}
      >
        {CARD_HEADERS[name].map((ele, eleIndex) => (
          <StyledTh
            id={`th_${ele}`}
            style={{
              textAlign: "left",
              width: eleIndex === 0 ? "20%" : "auto",
            }}
            key={ele}
          >
            {ele}
          </StyledTh>
        ))}
      </tr>
    </thead>
    {tableBodyElements}
  </StyledTable>
);

export const getCardType = (val: number): string => {
  switch (val) {
    case 1:
      return "Credit";
    case 2:
      return "Debit";
    case 3:
      return "Prepaid";
    case 4:
      return "Charge Card";
    case 5:
      return "Debit or Credit";
    default:
      return "Unknown";
  }
};

export const getIssuerIcon = (val: string): string | undefined => {
  switch (val.toLowerCase()) {
    case "american express":
      return american_express;
    case "diners club":
      return diners_club;
    case "discover":
      return discover;
    case "elo":
      return elo;
    case "hiper":
      return hiper;
    case "jcb":
      return jcb;
    case "laser":
      return laser;
    case "maestro":
      return maestro;
    case "mastercard":
      return mastercard;
    case "troy":
      return troy;
    case "unionpay":
      return unionpay;
    case "visa":
      return visa;
    default:
      return undefined;
  }
};
