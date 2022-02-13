import { CHECKPOINTS } from "sardine-dashboard-typescript-definitions";

const kCustomActions = "custom_actions";
export const saveActionToStorage = (action: string) => {
  const actions = localStorage.getItem(kCustomActions) || "";
  localStorage.setItem(kCustomActions, `${actions}${actions.length > 0 ? "," : ""}${action}`);
};

const kCustomActionlevels = "custom_levels";
export const saveActionLevelToStorage = (value: string) => {
  const levels = localStorage.getItem(kCustomActionlevels) || "";
  localStorage.setItem(kCustomActionlevels, `${levels}${levels.length > 0 ? "," : ""}${value}`);
};

export const DATA_TYPES = {
  int: "int",
  float: "float",
  bool: "bool",
  string: "string",
  stringarray: "array",
  function: "function",
} as const;
export type DataType = typeof DATA_TYPES[keyof typeof DATA_TYPES];

export const JARO_WINKLER_DISTANCE = "Jaro-Winkler distance";
export const EQUALS_TO_FUNCTION = "EqualsTo";

export interface FunctionChild {
  title: string;
  sample: string;
  value: string;
  description: string;
  dataType: string;
  hasOperator: boolean;
}

export interface BatchRuleData {
  BatchDuration: string;
  BatchCount: string;
}

const functionChild = (
  title: string,
  sample: string,
  value: string,
  description: string,
  dataType: string,
  hasOperator: boolean
) => ({
  title,
  sample,
  value,
  description,
  dataType,
  hasOperator,
});

export const FUNCTIONS = "Functions";
export const MULTI_FEATURE_FUNCTIONS: string[] = [JARO_WINKLER_DISTANCE, EQUALS_TO_FUNCTION];
export const supportedFunctions: FunctionChild[] = [
  functionChild(
    JARO_WINKLER_DISTANCE,
    "0.3",
    "JaroWinkler",
    "Jaro–Winkler distance is a string metric measuring an edit distance between two sequences",
    DATA_TYPES.float,
    true
  ),
  functionChild(
    "Contains",
    "mailinator",
    "Contains",
    "Contains is the function to check partial equality within the value",
    DATA_TYPES.string,
    false
  ),
  functionChild(
    "HasPrefix",
    "+1",
    "HasPrefix",
    "HasPrefix is the function to check prefix of the value",
    DATA_TYPES.string,
    false
  ),
  functionChild("HasSuffix", "", "HasSuffix", "HasSuffix is the function to check suffix of the value", DATA_TYPES.string, false),
  functionChild(
    EQUALS_TO_FUNCTION,
    "",
    EQUALS_TO_FUNCTION,
    "EqualsTo is the function to compare two values",
    DATA_TYPES.bool,
    true
  ),
];

const DURATION_VALUES = ["all", "min", "mins", "hrs", "day", "days", "mth", "mths"] as const;

export const isWideScreen = () => window.screen.width > 800;

export const getHasOperator = (val: string) => {
  let hasOperator = true;

  supportedFunctions.forEach((f) => {
    if (val.includes(f.value)) {
      hasOperator = f.hasOperator;
    }
  });

  return hasOperator;
};

export class ItemModel {
  title = "";

  items: ItemModel[] = [];

  sample = "";

  dataType: string = DATA_TYPES.int;

  isDemo = true;

  // sometime we want to hide live features and make it only avaialble to admin and backend code.
  isHidden = false;

  description = "N/A";

  constructor(title: string, items: ItemModel[] = [], sample = "", dataType = "", isDemo = true, description = "N/A") {
    this.title = title;
    this.items = items;
    this.sample = sample;
    this.dataType = dataType;
    this.isDemo = isDemo;
    this.description = description;
  }
}

const newChild = (title: string, sample: string, type: string, description = "N/A", isDemo = true) =>
  new ItemModel(title, [], sample, type, isDemo, description);

const intChild = (title: string, description = "N/A", isDemo = true) =>
  new ItemModel(title, [], "1", DATA_TYPES.int, isDemo, description);

const boolChild = (title: string, description = "N/A", isDemo = true) =>
  new ItemModel(title, [], "true", DATA_TYPES.bool, isDemo, description);

export const stringChild = (title: string, description = "N/A", isDemo = false) =>
  new ItemModel(title, [], '""', DATA_TYPES.string, isDemo, description);

export const floatChild = (title: string, description = "N/A", isDemo = false) =>
  new ItemModel(title, [], '""', DATA_TYPES.float, isDemo, description);

const hide = (i: ItemModel): ItemModel => ({ ...i, isHidden: true });

export const OPERATORS = [">", ">=", "<", "<=", "==", "!=", " in ", " not in "] as const;

export const ADD_CUSTOM = "+ add custom";
export const DROP_DOWN_BG = "#EAEDF2";
export const getRiskValues = () => {
  const levels = localStorage.getItem(kCustomActionlevels) || "";
  const customLevels = levels.length > 0 ? levels.split(",") : [];

  return ["low", "medium", "high", "very_high", ...customLevels, ADD_CUSTOM];
};

export const DROPDOWN_TYPES = {
  Rules: "condition",
  Operator: "operator",
  ReasonCode: "reasonCode",
  ReasonOperator: "reasonOperator",
  RiskLevel: "riskLevel",
  RiskValue: "riskValue",
  Checkpoint: "check Point",
  Organization: "organization",
  Queue: "select queue",
  QueueUser: "assign user",
} as const;
export type DropdownType = typeof DROPDOWN_TYPES[keyof typeof DROPDOWN_TYPES];
const DROPDOWN_TYPE_VALUES = Object.values(DROPDOWN_TYPES);
export const isDropdownType = (type: string): type is DropdownType => type in DROPDOWN_TYPE_VALUES;

export const BATCH_RULE_DURATIONS = ["7DAYS", "30DAYS", "60DAYS", "90DAYS"] as const;

export const CHECK_POINTS = CHECKPOINTS;

export type CheckPoint = typeof CHECK_POINTS[keyof typeof CHECK_POINTS];
const CUSTOMER_CHECKPOINTS = [
  CHECK_POINTS.Customer,
  CHECK_POINTS.AML,
  CHECK_POINTS.AMLBank,
  CHECK_POINTS.AMLIssuer,
  CHECK_POINTS.AMLCrypto,
  CHECK_POINTS.Onboarding,
  CHECK_POINTS.Payment,
  CHECK_POINTS.Withdrawal,
  CHECK_POINTS.ACH,
];
const arrayCustomerCheckpoints = CUSTOMER_CHECKPOINTS.map((c) => c.toLowerCase());

const issuingCheckpoints = [CHECK_POINTS.IssuingRisk].map((c) => c.toLowerCase());

const shouldVisible = (i: ItemModel, isDemoMode: boolean, isSuperAdmin: boolean): boolean => {
  if (isDemoMode) {
    // In demo UI everything is visible
    return true;
  }
  if (i.isDemo && i.items.length === 0) {
    // In non-demo mode, hide demo feature
    return false;
  }
  if (!i.items || i.items.length === 0) {
    // leaf node, show it unless it's marked as hidden
    return !i.isHidden || isSuperAdmin;
  }
  if (!i.isDemo) {
    // live feature, show it unless it's marked as hidden
    return !i.isHidden || isSuperAdmin;
  }
  // if any of child should visible, so does parent.
  return i.items.filter((f) => shouldVisible(f, isDemoMode, isSuperAdmin)).length > 0;
};

const filterVisibleFeatures = (items: ItemModel[], isDemoMode: boolean, isSuperAdmin: boolean): ItemModel[] => {
  const shouldVisibleBound = (i: ItemModel) => shouldVisible(i, isDemoMode, isSuperAdmin);
  const liveFeatures = items.filter((f) => f.items.filter(shouldVisibleBound).length > 0 || !f.isDemo);
  liveFeatures.forEach((f) => {
    // eslint-disable-next-line no-param-reassign
    f.items = f.items.filter(shouldVisibleBound);
  });
  return liveFeatures;
};

const customFeatures = (organization?: string) => {
  const sardine = ["demo.sardine.ai", "demo.dev.sardine.ai"];
  const moonpay = ["dev.moonpay", "trial.moonpay.io"];
  const wert = ["wert"];
  const relayfi = ["dev.relayfi", "relayfi"];
  const giveCrypto = ["trial.givecrypto.org", "dev.givecrypto.org", "givecrypto.org"];
  const featureLists = [
    {
      feature: newChild(
        "passwordChangedAt",
        "",
        DATA_TYPES.int,
        "Timestamp (in milliseconds) when password last changed for this user",
        false
      ),
      organization: moonpay,
    },
    {
      feature: newChild("sourceLevel", "", DATA_TYPES.string, "riskiness of payment source", false),
      organization: moonpay,
    },
    {
      feature: newChild("kyc", "", DATA_TYPES.bool, "whether customer passed KYC or not", false),
      organization: moonpay,
    },
    {
      feature: newChild("kyc_user_level", "", DATA_TYPES.string, "status of KYC", false),
      organization: wert,
    },
    {
      feature: newChild("order_type", "", DATA_TYPES.string, "simple or SC(NFT)", false),
      organization: wert,
    },
    {
      feature: newChild("business_entity_formation_date", "", DATA_TYPES.int, "timestamp in millis", false),
      organization: relayfi,
    },
    {
      feature: newChild("domain_registered_date", "", DATA_TYPES.int, "timestamp in millis", false),
      organization: relayfi,
    },
    {
      feature: newChild(
        "is_bookkeeping_or_acounting",
        "",
        DATA_TYPES.bool,
        "Whether the id is for a book keeping or accounting firm",
        false
      ),
      organization: ["relayfi", "dev.relayfi"],
    },
    {
      feature: newChild("cohortScores", "", DATA_TYPES.stringarray, "", false),
      organization: giveCrypto,
    },
    {
      feature: newChild("phoneCarrier", "", DATA_TYPES.string, "", false),
      organization: giveCrypto,
    },
    {
      feature: newChild("phoneCarrierType", "", DATA_TYPES.string, "", false),
      organization: giveCrypto,
    },
  ];
  const org = (organization || "").toLowerCase();
  const features: ItemModel[] = featureLists
    .filter((f) => f.organization.includes(org) || sardine.includes(org))
    .map((f) => f.feature);

  return features.length === 0
    ? [
        newChild(
          "ToBeImplemented",
          "n",
          DATA_TYPES.string,
          "Please contact sardine to use custom feature value in rule engine",
          false
        ),
      ]
    : features;
};

// Fatures to prepare rule condition
export const getRulesData = (isDemoMode: boolean, checkpoint: string, isSuperAdmin: boolean, organization?: string) => {
  const DT = DATA_TYPES;

  const BankAccountAddress = [
    stringChild("Street", "street address associated with the bank account"),
    stringChild("City", "bank account address city"),
    stringChild("Region", "bank account state"),
    stringChild("PostalCode", "bank account postal code"),
    stringChild("Country", "bank account country"),
    boolChild("StreetMismatch", "mismatch between bank account street address and customer provided street address", false),
    boolChild("CityMismatch", "mismatch between bank account address city and customer provided address city", false),
    boolChild("RegionMismatch", "mismatch between bank account state and customer provided state", false),
    boolChild("PostalCodeMismatch", "mismatch between bank account postal code and customer provided postal code", false),
    boolChild("CountryMismatch", "mismatch between bank account country and customer provided country", false),
  ];

  const AccountIdentity = [
    stringChild("Email", "bank account email"),
    boolChild("EmailMismatch", "bank email mismatches customer provided email"),
    stringChild("Phone", "bank account phone number"),
    boolChild("PhoneMismatch", "bank phone number mismatches customer provided phone."),
    stringChild("PhoneType", "bank account phone number"),
    stringChild("FirstName", "first name associated with the bank account"),
    stringChild("LastName", "last name associated with the bank account"),
    boolChild("FirstNameMismatch", "first name associated with bank account does not match customer first name", false),
    boolChild("LastNameMismatch", "last name associated with bank account does not match customer last name", false),
    intChild("NumOwnerNames", "number of owner names associated with the bank account", false),
    new ItemModel("Address", BankAccountAddress),
  ];

  const batchTransactionAggregationDays = [new ItemModel("30DAYS")];

  const batchTransactionAggregationFeatures = [
    new ItemModel(
      "CountZScore",
      batchTransactionAggregationDays,
      "3.0",
      DT.float,
      false,
      "Z-Score of the daily transaction count, relative to average of daily transaction counts over aggregation period"
    ),
    new ItemModel(
      "CountDifferenceFromMean",
      batchTransactionAggregationDays,
      "100.0",
      DT.float,
      false,
      "Difference of the daily transaction count and average of daily transaction counts over aggregation period"
    ),
    new ItemModel(
      "AmountZScore",
      batchTransactionAggregationDays,
      "3.0",
      DT.float,
      false,
      "Z-Score of the daily transaction total, relative to average of daily transaction totals over aggregation period"
    ),
    new ItemModel(
      "AMountDifferenceFromMean",
      batchTransactionAggregationDays,
      "100.0",
      DT.float,
      false,
      "Difference of the daily transaction total and average of daily transaction totals over aggregation period"
    ),
  ];

  const issuingFeatures = [
    new ItemModel("Merchant", [
      newChild("Mcc", "5734", DT.string, "Merchant category code for merchant", false),
      newChild("Name", "Corner Book Shop", DT.string, "Name of merchant", false),
    ]),
    new ItemModel("Terminal", [
      newChild("Type", "POS_TERMINAL", DT.string, "Terminal type", false),
      newChild("Operator", "CUSTOMER_OPERATED", DT.string, "Terminal type", false),
      boolChild("OnPremise", "On-premise transaction", false),
      boolChild("PinCapability", "Terminal has PIN entry capability", false),
    ]),
    new ItemModel("EntryInfo", [
      stringChild(
        "PAN",
        "How PAN was entered - manual, emv_chip, qr_or_barcode, contactless, magstripe, applepay, googlepay, or other"
      ),
      boolChild("PinEntered", "PIN was entered", false),
      boolChild("CardPresent", "Card-present transaction", false),
      boolChild("CardHolderPresent", "Cardholder was present during transaction", false),
    ]),
    new ItemModel("Validation", [
      boolChild("AvsZipMatch", "AVS zipcode match", false),
      boolChild("AvsStreetMatch", "AVS street match", false),
      boolChild("CvvMatch", "CVV match", false),
    ]),
    new ItemModel("FraudScore", [
      intChild("NetworkScore", "Network fraud score", false),
      newChild("PartnerScore", "0.86", DT.float, "Partner fraud score", false),
    ]),
    new ItemModel("Transaction", [
      newChild("Amount", "0.86", DT.float, "Transaction amount in local currency", false),
      newChild("AmountUsd", "0.86", DT.float, "Transaction amount in USD", false),
      newChild("CurrencyCode", "USD", DT.string, "Transaction curency", false),
      boolChild("ForeignTransaction", "Transaction was performed in a country other than the cardholder's home country", false),
      boolChild("Recurring", "Transaction was previously authorized as a recurring transaction", false),
      intChild("HourOfDay", "Integer indicating hour of day (ranging from 0 to 23). Missing values are indicated by -1.", false),
      intChild(
        "DayOfMonth",
        "Integer indicating day of month (ranging from 1 to 31). Missing values are indicated by -1.",
        false
      ),
      stringChild(
        "DayOfWeek",
        'String indicating day of week (e.g. "Monday"). Missing values are indicated by the empty string.'
      ),
    ]),
    new ItemModel("BatchTransactionAggregation", [
      new ItemModel("CustomerAggregation", batchTransactionAggregationFeatures),
      new ItemModel("CustomerMccAggregation", batchTransactionAggregationFeatures),
    ]),
    new ItemModel("CardPresentGaps", [
      intChild("TimeSinceCardWasUsedInAnotherCity", "Time between card-present transactions in different cities", false),
      intChild("TimeSinceCardWasUsedInAnotherCountry", "Time between card-present transactions in different countries", false),
      intChild("TimeSinceCardWasUsedInAnotherRegion", "Time between card-present transactions in different regions", false),
      intChild(
        "TimeSinceCardWasUsedInAnotherPostalCode",
        "Time between card-present transactions in different postal codes",
        false
      ),
    ]),
    new ItemModel("UserAggregation", [
      new ItemModel(
        "InAmount",
        [
          new ItemModel("ALL"),
          new ItemModel("30MINS"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of incoming transactions"
      ),
      new ItemModel(
        "OutAmount",
        [
          new ItemModel("ALL"),
          new ItemModel("30MINS"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of outgoing transactions"
      ),
      new ItemModel(
        "InCount",
        [
          new ItemModel("ALL"),
          new ItemModel("30MINS"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total count of incoming transactions"
      ),
      new ItemModel(
        "OutCount",
        [
          new ItemModel("ALL"),
          new ItemModel("30MINS"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total count of outgoing transactions"
      ),
    ]),
  ];

  if (issuingCheckpoints.includes(checkpoint.toLowerCase())) {
    return [
      ...filterVisibleFeatures(issuingFeatures, isDemoMode, isSuperAdmin),
      new ItemModel(FUNCTIONS, [], "", DT.function, false, "Custom functions to support advanced operations"),
    ];
  }

  const paymentMethodFeatures = [
    new ItemModel("Bank", [
      new ItemModel(
        "PercentageMoneyOut",
        [new ItemModel("1DAY"), new ItemModel("1MTH")],
        "75",
        DT.int,
        true,
        "Percentage of money moved relative to your initial balance"
      ),
      new ItemModel(
        "NewCardPercentageMoneyOut",
        [new ItemModel("1DAY"), new ItemModel("1MTH")],
        "75",
        DT.int,
        true,
        "NewCard is any card opened within last 1 week. It can be multiple cards also. e.g. if balance is $100 and $25 was moved to new card 1 and $25 to new card 2 then this field will have value 50(%)"
      ),
      new ItemModel(
        "NewDevicePercentageMoneyOut",
        [new ItemModel("1DAY"), new ItemModel("1MTH")],
        "75",
        DT.int,
        true,
        "Here the new Device is any device added within last 30 days"
      ),
      newChild("AccountNumber", "021000021", DT.string, "Account Number"),
      newChild("RoutingNumber", "122105155", DT.string, "Routing Number"),
      new ItemModel("PrimaryIdentity", AccountIdentity, "", "", false, "Primary Bank Account Identity"),
      new ItemModel("SecondaryIdentity", AccountIdentity, "", "", false, "Secondary Bank Account Identity"),
      floatChild("CurrentBalance", "current balance of the bank account", false),
      floatChild("AvailableBalance", "available balance of the bank account", false),
      intChild("BalanceLastUpdated", "Unix time for when balance was last updated", false),
      intChild("DaysSinceBalanceLastUpdated", "number of days since balance was last updated", false),
      // NSF Related Features
      intChild("NSFCount", "previous NSF count", false),
      floatChild("NSFTotalAmount", "total NSF transaction amount", false),
      floatChild("NSFAvgAmount", "average NSF transaction amount", false),
      intChild("NSFLastDate", "Unix time for when the last NSF occurred", false),
      floatChild("NSFLastAmount", "previous NSF transaction amount", false),
      // Overdraft Related Features
      intChild("OverdraftCount", "previous overdraft count from this account", false),
      floatChild("OverdraftTotalAmount", "total overdraft amount", false),
      floatChild("OverdraftAvgAmount", "average overdraft transaction amount", false),
      intChild("OverdraftLastDate", "Unix time for when the last overdraft occurred", false),
      floatChild("OverdraftLastAmount", "previous overdraft transaction amount", false),
      floatChild("TransactionAmountAsBalanceFraction", "transaction amount as a fraction of the bank balance", false),
      newChild("RiskLevel", "high", DT.string, "Bank risk level"),
      newChild("FirstSeenAt", "1617137009018", DT.string, "Date in unix timestamp when the bank account was first seen."),

      // Live features
      stringChild("FullName", "Name of the user"),
      stringChild("Address", "Address of the user"),
      stringChild("PhoneNumber", "Phone number of the user"),
      newChild("AccountResponseCode", "[9, 11]", DT.stringarray, "Response codes for an account", false),
      intChild("AccountsLinked", "Is acccount linked to given user", false),
      newChild("MicrobiltCode", "50..75", DT.string, "Response code from microbilt", false),
      newChild("MicrobiltStr", '"W"', DT.string, "Response string from microbilt", false),
      intChild("CountTransactions", "Count of transactions", false),
      new ItemModel(
        "OutAmount",
        [new ItemModel("ALL"), new ItemModel("24HRS")],
        "1",
        DT.int,
        false,
        "Sum of total money spent (in USD)"
      ),
      intChild("Balance", "Balance of the account", false),
      stringChild("CurrencyCode", "currencyCode"),
    ]),
    new ItemModel("Card", [
      stringChild("First6", "first 6 digits of card. also known as BIN (Bank Identification Number)"),
      stringChild("Last4", "last 4 digits of card"),
      stringChild("Hash", "hash of card number as passed in API"),
      stringChild("Brand", "card brand. eg VISA or MASTERCARD"),
      stringChild("Issuer", "name of card issuer. eg CITIBANK"),
      stringChild(
        "Level",
        "Level of the card. Some common values are - Some common examples are - PREPAID,BUSINESS, PREMIUM, PLATINUM"
      ),
      stringChild("Type", "Type of card - credit or debit"),
      stringChild("Country", "card issuer country"),
      stringChild("Zip", "card issuer zip code"),
      stringChild("City", "card issuer city"),
      newChild("FirstSeenAt", "1617137009018", DT.string, "Date in unix timestamp when the card was first seen."),
      intChild("CountTransactions", "Count of transactions", false),
      intChild("TotalAmountSpent", "Sum of total money spent (in USD)", false),
      intChild("CountUsers", "Count of users associated with this card", false),
      intChild("CountTransactionsLastFiveMin", "count of transactions in last 5 mins", false),
      intChild("CountTransactionsLastHalfHour", "count of transactions in last half hour", false),
      intChild("CountTransactionsLastOneDay", "count of transactions in the last 1 day", false),
      intChild("CountTransactionsLastWeek", "count of transactions in the last week", false),
    ]),
    new ItemModel("Crypto", [
      newChild("AddressRiskLevel", "high", DT.string, "AddressRiskLevel coinbase address risk level ratings", false),
      newChild("UserRiskLevel", "high", DT.string, "UserRiskLevel coinbase user risk level ratings", false),
      newChild("Address", "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", DT.string, "Recipient address", false),
      newChild("Asset", "BTC", DT.string, "Asset eg. BTC", false),
      intChild("UsersUsingCryptoAddressCount", "UsersUsingCryptoAddressCount number of users using the crypto address", false),
      newChild("ReasonCodes", `["address category"]`, DT.stringarray, "ReasonCodes  eg. address category", false),
      boolChild("IsBlocklisted", "crypto address is blocklisted", false),
    ]),

    stringChild("Type", "Type of payment method"),
  ];

  const deviceFeatures = [
    new ItemModel(
      "Device",
      [
        newChild("ID", "03bbe826-4201-438f-ac25-916ccb7f0952", DT.string, "ID of the device generated by sardine SDK", false),
        newChild(
          "TransientDeviceID",
          "02BB-CCFF-FEDD-1122",
          DT.string,
          "Transient unique ID of the device generated by sardine SDK",
          false
        ),
        new ItemModel("TransientDeviceIDAggFeatures", [
          intChild("CountEmails", "number of emails associated with the transient device ID", false),
          intChild("CountPhones", "number of phone numbers associated with the transient device ID", false),
          intChild("CountCities", "number of cities associated with the transient device ID", false),
          intChild("CountCustomerIDs", "number of customers associated with the transient device ID", false),
          intChild("CountCountries", "number of countries associated with the transient device ID", false),
          intChild("CountFirstNames", "number of first names associated with the transient device ID", false),
          intChild("CountLastNames", "number of last names associated with the transient device ID", false),
          intChild("CountRegions", "number of states associated with the transient device ID", false),
        ]),
        newChild("Fingerprint", "03bbe826-4201-438f-ac25-916ccb7f0952", DT.string, "Fingerprint of the device.", false),
        newChild("FingerprintConfidence", "80", DT.int, "Confidence Score of the fingerprint", false),
        newChild(
          "AccountDeviceId",
          "0987acd8-4201-438f-ac25-916ccb7f0952",
          DT.string,
          "Persistent account device ID for device.",
          false
        ),
        newChild("Language", "en-US", DT.string, "Browser or device language", false),
        newChild("Browser", "Chrome", DT.string, "Browser", false),
        newChild("OS", "iOS", DT.string, "OS", false),
        newChild(
          "TrueOS",
          "Mac/iOS",
          DT.string,
          "True OS (eg if user use Android emulator on Mac OS, trueOS would be 'Mac/iOS')",
          false
        ),
        newChild("Model", "SM-G960W", DT.string, "Model of the device", false),
        boolChild("IsEmulator", "If device is a mobile emulator like BlueStacks", false),
        boolChild("IsRooted", "If device is rooted", false),
        newChild(
          "Reputation",
          "80",
          DT.string,
          "Reputation of device based on IP address history and fraud feedback data",
          false
        ),
        boolChild("IsBlocklisted", "Manually marked as bad from our dashboard", false),
        boolChild("IsFraudulent", "Reported as fraudulent via /feedback API by any of merchant in sardine network", false),
        boolChild("IsAllowlisted", "User is allowlisted"),
        newChild("RiskLevel", "85", DT.int, "RiskLevel  of the current session"),
        newChild("FraudScore", "90", DT.int, "Users Fraud Score returned in Device API via our machine learning model"),
        intChild(
          "DistanceIPGps",
          "Distance in miles between IP address and GPS address city (available only if you integrate sardine's mobile SDKs)"
        ),
        intChild("DistanceBssidIP", "Distance between BSSID and IP"),
        newChild("FirstSeenAt", "1617137009018", DT.int, "Time in unix timestamp when the device was first seen", false),
        newChild("CountEmails", "2", DT.int, "Number of unique emails associated with this device-id", false),
        newChild("CountPhones", "2", DT.int, "Number of unique phone numbers associated with this device-id", false),
        newChild("CountCities", "2", DT.int, "Number of unique cities used in the addresses from this device-id", false),
        newChild("CountCustomerIDs", "2", DT.int, "Number of unique customer accounts associated with this device-id", false),
        newChild(
          "CountFirstNames",
          "2",
          DT.int,
          "Number of unique first names in the addresses associated with this device-id",
          false
        ),
        newChild(
          "CountLastNames",
          "2",
          DT.int,
          "Number of unique last names in the addresses associated with this device-id",
          false
        ),
        newChild(
          "CountCountries",
          "2",
          DT.int,
          "Number of unique countries in the addresses associated with this device-id",
          false
        ),
        newChild(
          "CountStates",
          "2",
          DT.int,
          "Number of unique states / region codes in the addresses associated with this device-id",
          false
        ),
        intChild("CountUsers", "Count of users (that you have sent to sardine APIs) associated with this Device", false),
        new ItemModel(
          "CountLinkedUsers",
          [new ItemModel("ALL"), new ItemModel("3MTH"), new ItemModel("3WKS"), new ItemModel("3HRS"), new ItemModel("3MIN")],
          "1",
          DT.int,
          true,
          "If the device is used by 1 user and the user used two other devices, then count any OTHER users associated those two devices"
        ),
        intChild("CountIPs", "Count of Any IP addresses associated with the device", false),
        intChild("CountStaticIPs", "Count of Home (eg Comcast)/ Static IP associated with the device", false),
      ].concat(
        arrayCustomerCheckpoints.includes(checkpoint.toLowerCase())
          ? [
              intChild("CountEmails", "Count of emails associated with the device"),
              intChild("CountPhones", "Count of phone numbers associated with the device"),
            ]
          : []
      )
    ),
    new ItemModel(
      "Session",
      [
        newChild("SessionKey", "", DT.string, "Session key", false),
        newChild("RiskLevel", "high", DT.string, "Risk level for the session", false),
        newChild("AMLRiskLevel", "high", DT.string, "AML risk level for the session", false),
        newChild("OS", "iOS", DT.string, "user-reported OS for the session", false),
        newChild("OSAnomaly", "high", DT.string, "Is  there an anomaly between TrueOS and OS?", false),
        newChild("Proxy", "high", DT.string, "Proxy level for the session. Expected values: high, medium, low", false),
        newChild(
          "DistanceIPGps",
          "20",
          DT.float,
          "Distance in miles between IP address  and GPS address city (only available if you use mobile SDKs and user grants GPS permission)"
        ),
        newChild("DeviceScore", "80", DT.int, "Session level device-riskiness Score (1 to 100)"),
        newChild("SessionKey", "03bbe826-4201-438f-ac25-916ccb7f0952", DT.string, "SessionKey"),
        boolChild("IsChecksumInvalid", "client side event data had an invalid checksum, indicating payload was tampered", false),
        intChild("IPCount", "number of IP addresses tied to this session", false),
        intChild("IPCountryCount", "number of country (inferred from IP address) tied to this session", false),

        intChild("TimezoneOffset", "Offset in number of hours between"),
        boolChild("IsRemoteDesktop", "Status of remote desktop active or not. Like TeamViwer, Anydesk, Zoom etc", false),

        // these features are already available in backend but let's not expose to customers
        hide(boolChild("LiedLanguages", "", false)),
        hide(boolChild("LiedResolution", "", false)),
        hide(boolChild("LiedOS", "", false)),
        hide(boolChild("LiedBrowser", "", false)),
      ].concat(
        arrayCustomerCheckpoints.includes(checkpoint.toLowerCase())
          ? [
              newChild("CustomerScore", "90", DT.int, "Session Level Customer Score (1 to 100)"),
              newChild("DistanceBssidIP", "25", DT.float, "Distance between BSSID and IP"),
            ]
          : []
      )
    ),
    new ItemModel("Biometric", [
      intChild("LTMAutoFill", "Autofill data from user's interaction with form(s)", false),
      intChild("LTMExpertKey", "", false),
      intChild("LTMCopyPaste", "Copy Paste data from user's interaction with form(s)", false),
      intChild("HesitationPercentageLTM", "Number of hesitation while filling the form(s)", false),
      intChild("NumDistractionEvents", "Number of distractions while filling the form(s)", false),
    ]),
    new ItemModel("IP", [
      newChild("V4Address", "192.0.2.1", DT.string, "IPV4 address"),
      newChild("V6Address", "18:36:F3:98:4F:9A", DT.string, "IPV6 address"),
      boolChild("Proxy", "If IP address is known to be Proxy"),
      boolChild("Vpn", "If IP address is known to be VPN"),
      newChild("Type", "Fixed Line ISP", DT.string, "Type of IP like Corporate, Fixed Line ISP", false),
      newChild("City", "SF", DT.string, "City from IP Address", false),
      newChild("Region", "CA", DT.string, "Region from IP Address", false),
      newChild("Country", "US", DT.string, "2 digit Country Code from IP Address", false),
      newChild("UsageType", "COM", DT.string, "UsageType from IP2Location i.e. COM, ORG, GOV, EDU etc", false),
    ]),
    new ItemModel("GPS", [
      newChild("City", "San Francisco", DT.string, "City from GPS co-ordinates", false),
      newChild("Region", "CA", DT.string, "Region from GPS co-ordinates", false),
      newChild("Country", "US", DT.string, "2 digit Country Code from GPS co-ordinates", false),
      newChild("MockLevel", "low", DT.string, "Likelihood of GPS coordinate being mocked - low, medium or high", false),
    ]),
  ];

  const transactionAggregationFeaturesOverDays = [
    new ItemModel("7DAYS"),
    new ItemModel("30DAYS"),
    new ItemModel("60DAYS"),
    new ItemModel("90DAYS"),
  ];

  const transactionAggregationFeatures = [
    new ItemModel(
      "ZScore",
      transactionAggregationFeaturesOverDays,
      "3.0",
      DT.float,
      false,
      "Z-Score of amount for transaction type (card, bank or crypto) (requires minimum 10 transactions at aggregation level)"
    ),
    new ItemModel(
      "DifferenceFromMean",
      transactionAggregationFeaturesOverDays,
      "100.0",
      DT.float,
      false,
      "Difference between amount and mean for transaction type (card, bank or crypto) (requires minimum 10 transactions at aggregation level)"
    ),
  ];

  const featuresArray = [
    ...deviceFeatures,
    new ItemModel("User", [
      newChild("Id", "c4ca4238a0b923820dcc509a6f75849b", DT.string, "Id of the user", false),
      stringChild("FirstName", "name provided by user"),
      stringChild("MiddleName", "name provided by user"),
      stringChild("LastName", "name provided by user"),
      intChild("AccountAge", "Age of account in milliseconds", false),
      intChild("AccountAgeInDays", "Age of the account in days", false),
      intChild("Age", "Age of user in years.", false),
      intChild("RiskScore", "Riskiness score of this user session, between 0 to 99", false),
      newChild("PostalCode", "94016", DT.string, "Postal code of the user", false),
      newChild("Region", "CA", DT.string, "Region of the user", false),
      newChild("Country", "US", DT.string, "Country of the user", false),
      intChild("CountDevices", "Count of devices associated with the user", false),
      intChild(
        "CountLinkedUsers",
        "If the device is used by 1 user and the user used two other devices, then count any OTHER users associated those two devices",
        false
      ),
      intChild("CountIPs", "Count of Any IP addresses associated with the user", false),
      intChild("CountStaticIPs", "Count of Home (eg Comcast)/ Static IP associated with the user", false),
      intChild("CountOSs", "Count different OS this user was accessing from", false),
      intChild("CountReferrers", "Count different referrers this user was accessing from", false),
      intChild("CountProxySessions", "Number of session where proxy marked as true", false),
      intChild("CountVpnSessions", "Number of session where vpn marked as true", false),
      intChild("CountOfSessions", "Number of total sessions"),
      newChild("FraudScore", "80", DT.int, "FraudScore of the customer from all data sources"),

      newChild(
        "FirstTransactionAt",
        "1617137009018",
        DT.int,
        "Date in unix timestamp when the user made first transaction.",
        false
      ),
      newChild(
        "LastTransactionAt",
        "1617137009018",
        DT.int,
        "Date in unix timestamp when the user made last transaction.",
        false
      ),

      intChild("CountCountries", "Number of distinct country"),

      intChild("CountPaymentMethods", "Count of payment methods associated to the user", false),
      intChild("CountCards", "Count of cards associated to the user", false),
      new ItemModel("CountCardsAdded", [new ItemModel("7DAYS")], "1", DT.int, false, "Count of cards added to the user"),
      new ItemModel(
        "InAmount",
        [
          new ItemModel("ALL"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of incoming transactions"
      ),
      new ItemModel(
        "OutAmount",
        [
          new ItemModel("ALL"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of outgoing transactions (money is going out from user's payment method) eg buy, deposit"
      ),
      new ItemModel(
        "AchWithdrawAmount",
        [
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of ACH withdrawal"
      ),
      new ItemModel(
        "WireWithdrawAmount",
        [
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of wire withdrawal"
      ),
      new ItemModel(
        "AchDepositAmount",
        [
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of ACH Deposit"
      ),
      new ItemModel(
        "WireDepositAmount",
        [
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of wire deposit"
      ),
      new ItemModel(
        "CryptoDepositAmount",
        [
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of crypto deposit"
      ),
      new ItemModel(
        "CryptoWithdrawAmount",
        [
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Total amount of crypto withdrawal"
      ),
      newChild(
        "AverageTimeInOut",
        "80",
        DT.float,
        "Average time for Crypto or Money to move in like deposit and move out like withdrawal or Sale"
      ),
      new ItemModel(
        "InCount",
        [
          new ItemModel("ALL"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Number of incoming transactions"
      ),
      new ItemModel(
        "OutCount",
        [
          new ItemModel("ALL"),
          new ItemModel("24HRS"),
          new ItemModel("7DAYS"),
          new ItemModel("30DAYS"),
          new ItemModel("60DAYS"),
          new ItemModel("90DAYS"),
        ],
        "1",
        DT.int,
        false,
        "Number of outgoing transactions (money is going out from user's payment method eg buy and deposit)"
      ),

      boolChild("IsBlocklisted", "Manually marked as bad from our dashboard", false),
      boolChild("IsFraudulent", "True if fraud feedback is sent (Card Not Present or ACH) via our /feedbacks AP", false),
      intChild("CountCryptoAddresses", "Count of all crypto addresses user has deposited from or withdrawn to"),
      intChild(
        "CountRiskyCryptoAddresses",
        "Count of risky crypto addresses that user has deposited from or withdrawn to",
        false
      ),
      boolChild("IsSSNCompleted", "Has the SSN been completed as part of the identity completion.", false),
      boolChild("IsDOBCompleted", "Has the Date of Birth been completed as part of the identity completion", false),
      stringChild("SSNCompletedConfidenceLevel", "the level of confidence in the SSN that was found"),
      stringChild("DOBCompletedConfidenceLevel", "the level of confidence in the date of birth that was found"),
      stringChild("OriginatingPartnerID", "the partner id that the user originated from"),

      new ItemModel("Onboarding", [
        stringChild("FullName", "Name of the user"),
        stringChild("Address", "Address of the user"),
        stringChild("City", "City of the user"),
        stringChild("Region", "Region of the user"),
        stringChild("Country", "Country of the user used in onboarding"),
        stringChild("PhoneNumber", "Phone number of the user"),
        newChild("PostalCode", "94016", DT.string, "Postal code of the user", false),
      ]),
      new ItemModel("IDVerification", [
        stringChild("FullName", "Name of the user"),
        stringChild("Address", "Address of the user"),
        stringChild("PhoneNumber", "Phone number of the user"),
      ]),
      new ItemModel("TimeSinceFirstSeen", [
        newChild("DeviceId", "1000000", DT.int, "Milliseconds since user was first seen with device ID.", false),
        newChild("DeviceIp", "1000000", DT.int, "Milliseconds since user was first seen with IP address.", false),
        newChild("Fingerprint", "1000000", DT.int, "Milliseconds since user was first seen with fingerprint.", false),
        newChild("AccountDeviceId", "1000000", DT.int, "Milliseconds since user was first seen with account device ID.", false),
        newChild("Os", "1000000", DT.int, "Milliseconds since user was first seen with operating system family.", false),
        newChild("Browser", "1000000", DT.int, "Milliseconds since user was first seen with this browser.", false),
        newChild("OnWeb", "1000000", DT.int, "Milliseconds since user was first seen on web (non-mobile app).", false),
        newChild("Language", "1000000", DT.int, "Milliseconds since user was first seen with language (e.g. en-US).", false),
        newChild(
          "LanguageWithoutLocale",
          "1000000",
          DT.int,
          "Milliseconds since user was first seen with language (e.g. en).",
          false
        ),
        newChild("RussianLanguage", "1000000", DT.int, "Milliseconds since user was first seen with Russian language.", false),
        newChild(
          "IndonesianLanguage",
          "1000000",
          DT.int,
          "Milliseconds since user was first seen with Indonesian language.",
          false
        ),
        newChild(
          "NigerianLanguage",
          "1000000",
          DT.int,
          "Milliseconds since user was first seen with en-NG (Nigerian English)language.",
          false
        ),
      ]),
    ]),
    new ItemModel("Email", [
      newChild("RiskLevel", "high", DT.string, "Get level from email", false),
      newChild("DomainScore", "1", DT.int, "Get level of email domain. higher is better"),
      boolChild("OnboardingMismatch", "Match of user-provided onboarding information to data we get from email"),
      newChild("FirstSeenAt", "1617137009018", DT.string, "Time in unix timestamp when the email was first seen", false),
      intChild("EmailAddressAge", "age of the email address", false),
      intChild("FirstVerificationDays", "number days back this email was verified on email intelligence platform", false),
      boolChild("IsNumeric", "true if the email address is numeric", false),
      intChild("CountSocialMediaLinks", "Count of Social Media like Github,Twitter, FB etc for the email", false),
      intChild("CountUsers", "Count of customer-ids using this email", false),
      intChild("CountPhoneNumbers", "Count of phone numbers using this email", false),
      intChild("CountFirstNames", "Count of first names using this email", false),
      intChild("CountLastNames", "Count of last names using this email", false),
      newChild("CountSocialMediaFriends", "20", DT.int, "Social media friends", false),
      boolChild("IsVerified", "Email was Verified by you", false),
      stringChild("EmailAddress", "email address"),
      stringChild("Domain", "domain"),
      boolChild("HasMxRecord", "Whether an MX record was found for the email domain.", false),
      boolChild("IsDisposable", "Is the domain of the email address a disposable domain. ", false),
      boolChild("IsRoleAccount", "Is the email address a role-based account. For example - admin, info, sales.", false),
      boolChild("IsSyntaxValid", "Is this a valid email address.", false),
      boolChild("IsDomainValid", "Is the email domain valid.", false),
      boolChild("IsSSNCompleted", "Has the SSN been completed as part of the identity completion.", false),
      boolChild("IsDOBCompleted", "Has the Date of Birth been completed as part of the identity completion", false),
      stringChild("SSNCompletedConfidenceLevel", "the level of confidence in the SSN that was found"),

      // Live features
      boolChild("HasData", "true if we found email intelligence about given email address", false),
      stringChild("Error", "error string about email intelligence. possible value is ERROR_FROM_PROVIDER"),
      stringChild("FullName", "Name of the user"),
      stringChild("Address", "billing address tied to email"),
      newChild("Score", "50..75", DT.int, "Email score", false),
      intChild("RelevantInfoId", "Id for email relevant information", false),
      newChild("DomainScore", "50..75", DT.int, "Email's domain score", false),
      intChild("DomainRelevantInfoId", "Id for email's domain relevant information", false),
      newChild("RiskBand", "1", DT.int, "Riskiness of email", false),
      stringChild("ReasonCode", "Reason codes related to this email"),
      boolChild("IsBlocklisted", "email address is blocklisted", false),
    ]),
    new ItemModel("Phone", [
      stringChild("PhoneNumber", "PhoneNumber"),
      newChild("RiskLevel", "high", DT.string, "Risk level from phone", false),
      newChild("PhoneType", "NonFixedVoIP", DT.string, "Mobile, Landline, FixedVoIP, NonFixedVoIP, or Other", false),
      newChild("PhoneCarrier", "Verizon", DT.string, "E.g. ATT, Verizon", false),
      newChild("SimTenure", "2020-12-12", DT.string, "How long this SIM card has been used?"),

      // Live features
      boolChild("HasData", "true if we found phone intelligence about given phone number", false),
      stringChild("Error", "error string about phone intelligence. possible values are INVALID_NUMBER and ERROR_FROM_PROVIDER"),
      boolChild("Verified", "Phone was Verified by you", false),
      newChild("TrustScore", "80", DT.int, "Score to trust the given number", false),
      newChild("AddressScore", "70", DT.int, "Score to trust the given address", false),
      newChild("NameScore", "60", DT.int, "Score to trust the given name", false),
      newChild("ReasonCodes", `["PIV"]`, DT.stringarray, "ReasonCodes", false),
      intChild("CountUsers", "Count of users associated with this phone number", false),
      intChild("CountEmails", "Count of emails associated with this phone number", false),
      intChild("CountFirstNames", "Count of first name associated with this phone number", false),
      intChild("CountLastNames", "Count of last name associated with this phone number", false),
      boolChild("DOBMatch", "DoB provided matched the DoB returned by phone intelligence provider", false),
      boolChild("Last4Match", "Last 4 of Tax-Id matched with Tax-Id returned by phone intelligence provider", false),
      boolChild("SSNMatch", "SSN matched with SSN returned by phone intelligence provider", false),
      boolChild("IsBlocklisted", "phone is blocklisted", false),
    ]),

    new ItemModel("Sanction", [
      stringChild(
        "SanctionLevel",
        "Sanction level is based on data from the most relevant organizations such as OFAC, United Nations, European Union etc."
      ),
      stringChild(
        "PepLevel",
        "Politically Exposed Persons (PEP) level define person's identity based on a manually sourced agenda of worldwide elections"
      ),
      stringChild("AdverseMediaLevel", "Adverse media level define person's visiblity on fraud/money laundering"),
      newChild("ReasonCodes", `["SDN"]`, DT.stringarray, "ReasonCodes", false),
    ]),

    new ItemModel("Transaction", [
      newChild("RiskLevel", "high", DT.string, "Risk level of transaction", false),
      newChild("AMLRiskLevel", "high", DT.string, "AML Risk level of transaction", false),
      newChild("Amount", "12.3", DT.float, "Transaction amount from the v1/customers API payload (in USD)", false),
      newChild("CurrencyCode", "USD", DT.string, "currency code", false),
      stringChild("ItemCategory", "item category from the v1/customers API payload"),
      stringChild("ActionType", "Indicates the type of transaction eg., buy, sell, deposit, withdraw, refund, or payment"),
      stringChild("MCC", "merchant category code"),
    ]),

    new ItemModel("TransactionAggregation", [
      new ItemModel("ClientAggregation", transactionAggregationFeatures),
      new ItemModel("CustomerAggregation", transactionAggregationFeatures),
    ]),

    new ItemModel("DocumentKYC", [
      stringChild("FirstName", "name extracted from the document"),
      stringChild("MiddleName", "name extracted from the document"),
      stringChild("LastName", "name extracted from the document"),
      stringChild("IssuingCountry", "2-digit country code"),
      stringChild("RiskLevel", "Overall riskiness of accepting this ID document. high, medium, low, or unknown"),
      stringChild("ForgeryLevel", "indicates the likelihood of submitted document is forged. high, medium, low"),
      stringChild("DocumentMatchLevel", "image quality of ID document. high, medium, low"),
      stringChild(
        "ImageQualityLevel",
        "likelihood of inputData match with the document image. high, medium, low, or not_applicable",
        false
      ),
      stringChild(
        "FaceMatchLevel",
        "likelihood of photo/selfie match with the document image. high, medium, low, not_applicable, or error",
        false
      ),
    ]),

    new ItemModel("PaymentMethod", paymentMethodFeatures),

    new ItemModel("RecipientPaymentMethod", paymentMethodFeatures),

    // Live modules with features
    new ItemModel("TaxID", [
      boolChild("HasData", "true if we found taxID intelligence about given taxID"),
      newChild("AbuseScore", "80", DT.int, "Abuse score of the ID", false),
      newChild("RiskLevel", "high", DT.string, "Risk level from tax Id", false),
      newChild("FirstPartySyntheticScore", "80", DT.int, "Score from their true name and date of birth, but an TaxID", false),
      newChild(
        "ThirdPartySyntheticScore",
        "80",
        DT.int,
        "Score applicants using a name, date of birth and TaxID combination that is completely fabricated",
        false
      ),
      newChild("IDTheftScore", "700", DT.int, "Score indicating if applicant is using another consumer's identity.", false),
      newChild(
        "NameMatch",
        "exact",
        DT.string,
        "If user-provided name matches with what is registered with TaxID. Possible values are 'exact', 'fuzzy' and 'nomatch'",
        false
      ),
      newChild(
        "DobMatch",
        "exact",
        DT.string,
        "If user-provided date of birth matches with what is registered with TaxID. Possible values are 'exact', 'fuzzy' and 'nomatch'",
        false
      ),
      newChild(
        "StateMatch",
        "exact",
        DT.string,
        "If user-provided residental state matches with what is registered with TaxID. Possible values are 'exact', 'fuzzy' and 'nomatch'",
        false
      ),
      newChild(
        "TaxIDMatch",
        "exact",
        DT.string,
        "If user-provided taxID msatches with kwnon record that most closely matches with name, dob and state",
        false
      ),
      newChild("SsnSharedCount", "3", DT.int, "The number of identities that share the same SSN.", false),
      newChild("NameDobSharedCount", "2", DT.int, "Number of identities that share the same Name and Date of Birth.", false),
      newChild(
        "SsnIssuanceDobMismatch",
        "false",
        DT.bool,
        " Whether the SSN was issued significantly later than usual for the Date of Birth.",
        false
      ),
      newChild("SsnIssuedBeforeDob", "true", DT.bool, " Whether the Date of Birth occurred after the SSN was issued.", false),
      newChild(
        "NameSsnSyntheticAddress",
        "true",
        DT.bool,
        " Whether the identity has been tied to bad addresses in the past.",
        false
      ),
      newChild(
        "SsnHistoryLongerMonths",
        "100",
        DT.int,
        "If another identity has a longer history with this SSN, the difference in months.",
        false
      ),
      newChild("SsnBogus", "true", DT.bool, "Whether the SSN is invalid.", false),
      stringChild("Error", "error string about taxID intelligence reterival. possible value is ERROR_FROM_PROVIDER"),
      newChild("ReasonCodes", `["SSF", "AHM"]`, DT.stringarray, "ReasonCodes", false),
    ]),

    new ItemModel("CustomerSession", [
      newChild("Flow", "onboarding", DT.string, "flow paramater given by you", false),
      newChild("PersonalCountryCode", "US", DT.string, "Country code", false),
      newChild("RiskScore", "80", DT.int, "Session risk score", false),
      newChild("IpCountryCodeMatch", "true", DT.bool, "If IP country matches address country", false),
      newChild("IpCityMatch", "false", DT.bool, "If IP city matches address city", false),
      newChild("IpRegionCodeMatch", "false", DT.bool, "If IP state matches address state", false),
      boolChild("CardCountryToBillingCountryMismatch", "whether the card bin country matches billing address country", false),
      boolChild("CardCountryToIDCountryMismatch", "whether the card bin country matches ID document country", false),
      newChild(
        "IPToCustomerAddressDistance",
        "-1",
        DT.int,
        "Distance between IP Geolocation to customer address in kilometers",
        false
      ),
      newChild(
        "GPSToCustomerAddressDistance",
        "-1",
        DT.int,
        "Distance between  customer GPS location to customer address in kilometers",
        false
      ),
    ]),
    new ItemModel("Custom", customFeatures(organization)),
    new ItemModel(FUNCTIONS, [], "", DT.function, false, "Custom functions to support advanced operations"),
    new ItemModel(
      "OutAmountRatio",
      [new ItemModel("24HRS"), new ItemModel("7DAYS"), new ItemModel("30DAYS"), new ItemModel("60DAYS"), new ItemModel("90DAYS")],
      "1",
      DT.int,
      false,
      "Total amount of outgoing transactions (money is going out from user's payment method) eg buy, deposit"
    ),
  ];

  if (checkpoint === "all") {
    return [...featuresArray, ...issuingFeatures];
  }

  if (!arrayCustomerCheckpoints.includes(checkpoint.toLowerCase())) {
    return [
      ...filterVisibleFeatures(deviceFeatures, isDemoMode, isSuperAdmin),
      new ItemModel(FUNCTIONS, [], "", DT.function, false, "Custom functions to support advanced operations"),
    ];
  }

  return filterVisibleFeatures(featuresArray, isDemoMode, isSuperAdmin);
};

export interface Reason {
  title: string;
  items: string[];
}

// Fatures to prepare reason code
export const getReasonCodeData = (): Reason[] => [
  {
    title: "ToStringArray",
    items: [],
  },
  {
    title: "IntToString",
    items: [],
  },
  {
    title: "EmptyStringArray()",
    items: [],
  },
  {
    title: "Phone",
    items: ["ReasonCodes"],
  },
  {
    title: "Bank",
    items: ["ResponseCode", "AccountResponseCode"],
  },
  {
    title: "Email",
    items: ["RelevantInfoId", "DomainRelevantInfoId"],
  },
];

export const getActionData = (isSuperAdmin: boolean, checkpoint: string) => {
  const actions = localStorage.getItem(kCustomActions) || "";
  const customActions = actions.length > 0 ? actions.split(",") : [];

  if (arrayCustomerCheckpoints.includes(checkpoint.toLowerCase())) {
    const defaultActions = ["riskLevel", "transaction.riskLevel", "transaction.amlRiskLevel"];
    return isSuperAdmin
      ? defaultActions
          .concat([
            "amlRiskLevel",
            "amlReportLevel",
            "emailLevel",
            "emailDomainLevel",
            "phoneLevel",
            "pepLevel",
            "sanctionLevel",
            "adverseMediaLevel",
            "bankLevel",
          ])
          .concat(customActions)
          .sort()
      : defaultActions.concat(customActions).sort();
  }

  if (issuingCheckpoints.includes(checkpoint.toLowerCase())) {
    return ["riskLevel"].concat(customActions).sort();
  }

  return ["behaviorBiometricLevel", "riskLevel"].concat(customActions).sort();
};

export const isDurationValue = (s: string) =>
  DURATION_VALUES.filter((d) => s.replace(/[0-9]/g, "").toLowerCase() === d).length > 0;

export const rulesForDataDictionary = (rules: ItemModel[], parentTitle: string, isDemo = false): ItemModel[] => {
  const rulesData: ItemModel[] = [];
  rules.forEach((r) => {
    const isDurations = r.items.map((i) => isDurationValue(i.title)).includes(true);
    if (r.items.length > 0 && !isDurations) {
      rulesData.push(...rulesForDataDictionary(r.items, parentTitle.length > 0 ? `${parentTitle}.${r.title}` : r.title, isDemo));
    } else {
      const rule = { ...r };
      rule.items = [];
      if (parentTitle.length > 0) {
        rule.title = `${parentTitle}.${rule.title}`;
      }
      rulesData.push(rule);
    }
  });

  const data = isDemo ? rulesData : rulesData.filter((data) => data.isDemo === false);
  return data;
};
