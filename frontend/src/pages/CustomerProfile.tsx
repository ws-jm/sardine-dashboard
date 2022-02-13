import React, { useEffect, useState } from "react";
import { getCustomerProfile, getCustomerBankDetails, getCustomerCardDetails, getCustomerCryptoDetails } from "utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import { Button, Tabs, Tab } from "react-bootstrap";
import { Transaction, AnyTodo, CustomerProfileResponse, CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { captureException } from "utils/errorUtils";
import { Grid } from "@material-ui/core";
import Badge from "components/Common/Badge";
import { renderReasonCodes, renderReasonCodesFromArray } from "utils/renderReasonCodes";
import { SESSION_DETAILS_PATH } from "modulePaths";
import BulletView, { BulletContainer } from "components/Common/BulletView";
import { useUserStore } from "store/user";
import Layout from "../components/Layout/Main";
import Loader from "../components/Common/Loader";
import { Link } from "../components/Common/Links";
import UserNetwork from "../components/Customers/UserView/UserNetwork";
import AccessControlPopUp from "../components/Customers/UserView/AccessControlPopUp";
import { GoogleMapsWrapper, GoogleStreetViewMap } from "../components/GoogleMaps";
import { StyledNavTitle, StyledStickyNav, StyledTitleName } from "../components/Dashboard/styles";
import {
  StyledMainDiv,
  PinContainer,
  InputGroupWrapper,
  DetailsHeaderParent,
  DetailsHeaderChild,
  DetailsHeaderValue,
  DetailsHeaderTile,
} from "../components/Customers/styles";
import {
  BankObject,
  buildBankObject,
  buildCardObject,
  buildCryptoObject,
  buildTransactionObject,
  CardContentFilled,
  CardNameWithHeaders,
  CardObject,
  CryptoObject,
  dedupeBankObjects,
  dedupeCardObjects,
  dedupeCryptoObjects,
  DivNoDataAvailable,
  getCardType,
  getIssuerIcon,
  KEY_BANK_DETAILS,
  KEY_CARD_DETAILS,
  KEY_CRYPTO_ADDRESSES,
  KEY_CUSTOMER_DETAILS,
  KEY_IDENTITY,
  KEY_TAX_ID_DETAILS,
  KEY_TRANSACTIONS,
  TableBodyBank,
  TableBodyCrypto,
  TableBodyOther,
  TableBodyTransactions,
  TransactionObject,
} from "../components/Customers/UserView";
import SessionsList from "../components/Customers/UserView/SessionsList";
import { TableCardSection } from "../components/Customers/UserView/TableCardSection";
import LoadingText from "../components/Common/LoadingText";
import { TableCardData } from "../components/Customers/UserView/TableCard";
import { DocumentVerificationSection } from "../components/Customers/UserView/DocumentVerification";
import {
  convertDatastoreSessionsToCustomerResponse,
  generateGoogleMapsUrlFromAddress,
  getAddressListFromCustomerResponse,
} from "../utils/customerSessionUtils";
import { GOOGLE_STREET_VIEW_MAP_STYLE, GOOGLE_STREET_VIEW_PANORAMA_OPTIONS } from "../constants";

export const renderCustomerNotFound = (customerId: string): JSX.Element => (
  <Grid container justify="center">
    {`No record found for customer id: ${customerId}.`}
  </Grid>
);

const SESSIONS_LIST = "Sessions by customer" as const;

const CardContentOrLoadingOrNoData = ({
  isLoading,
  hasData,
  name,
  tableBodyElements,
}: {
  isLoading: boolean;
  hasData: boolean;
  name: CardNameWithHeaders;
  tableBodyElements: JSX.Element[];
}): JSX.Element =>
  isLoading ? (
    <LoadingText />
  ) : !hasData ? (
    <DivNoDataAvailable />
  ) : (
    <CardContentFilled name={name} tableBodyElements={tableBodyElements} />
  );

const AddressContainer = ({ addresses }: { addresses: string[] }): JSX.Element => (
  <>
    {addresses && (
      <BulletContainer>
        {addresses.map((address, index) => (
          <div key={address}>
            <div>
              <Link id="address_link" href={generateGoogleMapsUrlFromAddress(address)} rel="noreferrer" target="_blank">
                {addresses[index] || "-"}
              </Link>
            </div>
          </div>
        ))}
      </BulletContainer>
    )}

    {addresses.length > 0 && (
      <GoogleMapsWrapper>
        <GoogleStreetViewMap
          address={addresses[0]}
          style={GOOGLE_STREET_VIEW_MAP_STYLE}
          panoramaOptions={GOOGLE_STREET_VIEW_PANORAMA_OPTIONS}
        />
      </GoogleMapsWrapper>
    )}
  </>
);

const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cusId = params.get("customerId") || "";
  const clientId = params.get("clientId") || "";

  const [customerProfile, setCustomerProfile] = useState<CustomerProfileResponse>();
  const [customerData, setCustomerData] = useState<CustomersResponse>();
  const [bankData, setBankData] = useState<BankObject[]>([]);
  const [cardData, setCardData] = useState<CardObject[]>([]);
  const [cryptoData, setcryptoData] = useState<CryptoObject[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionObject[]>([]);

  const [selectedTab, setSelectedTab] = useState("overview");
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingCrypto, setloadingCrypto] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const { addToast } = useToasts();
  const [customerNotFound, setCustomerNotFound] = useState(false);

  const isLoading = loadingTransactions || loadingCards || loadingCrypto;
  const organisation = useUserStore(({ organisation }) => organisation);

  let cardsData: TableCardData[] = [
    {
      key: KEY_CUSTOMER_DETAILS,
      type: "card",
      value: [
        ["flow", "Session flow, provided by you"],
        ["email_address", "Email Address of customer, provided by you"],
        ["phone", "Phone of customer, provided by you"],
        ["carrier", "Carrier provider for phone number"],
        ["phone_country", "Country code based on phone number"],
        ["is_email_verified", "If email was verified by you"],
        ["is_phone_verified", "If phone number was verified by you"],
        ["date_of_birth", "Customer's date of birth, provided by you"],
        {
          key: "address",
          description: "Customer's address, provided by you",
          component:
            customerData === undefined ? (
              <>-</>
            ) : (
              <AddressContainer addresses={customerData === undefined ? [] : getAddressListFromCustomerResponse(customerData)} />
            ),
        },
        {
          key: "facebook_Link",
          description: "Facebook Link associated to given email address",
          component: <BulletView data={customerData?.facebook_Link || ""} isLink />,
        },
        {
          key: "Twitter_Link",
          description: "Twitter Link associated to given email address",
          component: <BulletView data={customerData?.Twitter_Link || ""} isLink />,
        },
        {
          key: "LinkedIn_Link",
          description: "Linkedin Link associated to given email address",
          component: <BulletView data={customerData?.LinkedIn_Link || ""} isLink />,
        },
        ["timestamp", "Timestamp"],
      ],
    },
  ];

  if (customerProfile && customerProfile.documentVerifications && customerProfile.documentVerifications.length > 0) {
    cardsData.push({
      key: "Document Verification",
      type: "component",
      component: isLoading ? (
        <LoadingText />
      ) : (
        <>
          {customerProfile.documentVerifications.map((doc) => (
            <DocumentVerificationSection documentVerification={doc} />
          ))}
        </>
      ),
    });
  }

  cardsData = cardsData.concat([
    {
      key: KEY_TAX_ID_DETAILS,
      type: "card",
      value: [
        { key: "tax_id", description: "Customer's SSN, provided by you", component: <>encrypted</> },
        ["tax_id_level", "Overall riskiness level of taxID"],
        ["tax_id_match", "If given taxID matches with our record"],
        ["tax_id_name_match", "If given name matches with our taxID record"],
        ["tax_id_dob_match", "If given date of birth matches with our taxID record"],
        ["tax_id_state_match", "If given state matches with our taxID record"],
        [
          "third_party_synthetic_score",
          "The identity is a first party synthetic. The application consists of a true name and DOB but a fictitious SSN. Commonly used when the applicant is trying to hide parts of their true profile. Between 0-1000, higher the riskiers",
        ],
        [
          "first_party_synthetic_score",
          "The identity is a first party synthetic. The application consists of a true name and DOB but a fictitious SSN. Commonly used when the applicant is trying to hide parts of their true profile. Between 0-1000, higher the riskier",
        ],
        [
          "abuse_score",
          "The identity is synthetic or the identity has previously been associated with fraudulent behaviors such as the purchase of authorized user tradelines. Between 0-1000, higher the riskier",
        ],
        ["id_theft_score", "The identity is a victim of ID theft. Between 0-1000, higher the riskier"],
        ["tax_reason_code", "Reason codes for tax risk level"],

        ["ssn_bogus", "SSN bogus"], // Update the tooltip description later
        ["name_dob_shared_count", "Name SSN shared count"],
        ["name_ssn_synthetic_address", "Name SSN Synthetic address"],
        ["ssn_history_longer_months", "SSN history longer months"],
        ["ssn_issuance_before_dob", "SSN issurance before DOB"],
        ["ssn_issuance_dob_mismatch", "SSN issurance DOB mismatch"],
        ["ssn_shared_count", "SSN shared count"],
        ["ssn_names_exact_match", "SSN names exact match"],
        ["ssn_phones_exact_match", "SSN phones exact match"],
        ["ssn_emails_exact_match", "SSN emails exact match"],
        ["ssn_dobs_exact_match", "SSN dobs exact match"],
      ],
    },
    {
      key: SESSIONS_LIST,
      type: "component",
      component: (
        <SessionsList
          isLoading={isLoading}
          sessions={customerProfile?.sessions || []}
          onClick={(searchQuery) => {
            navigate({
              pathname: SESSION_DETAILS_PATH,
              search: searchQuery,
            });
            navigate(0); // Refresh the page. TODO: Change the way to update the filter.
          }}
        />
      ),
    },
    {
      key: KEY_IDENTITY,
      type: "card",
      value: [
        ["email_level", "Email risk level"],
        ["phone_level", "Phone risk level"],
        ["email_domain_level", "Email domain risk level"],
        {
          key: "email_reason_codes",
          description: "Reason codes for email risk level",
          component: <>{customerData ? renderReasonCodes(customerData?.email_reason_codes) : "-"}</>,
        },
        ["email_reason", "Email risk level summary"],
        {
          key: "phone_reason_codes",
          description: "Reason codes for phone risk level",
          component: (
            <>{customerData && customerData.phone_reason_codes ? renderReasonCodes(customerData.phone_reason_codes) : "-"}</>
          ),
        },
        ["phonescore_reason", "Phone risk level summary"],
        ["customer_score", "Riskiness score of this customer session, higher score means riskier. Range: (0-100)."],
        [
          "name_score",
          "Match score of user's name, provided by you and name associated with phone number. Range: (0-100). 100 means exact match",
        ],
        [
          "address_score",
          "Match score of user's address, provided by you and address associated with phone number.Range: (0-100). 100 means exact match",
        ],
        ["risk_band", "Riskiness of email. Range: (1-6), where 6 is the most high risk"],
        ["email_owner_name", "User's name associated with email"],
        [
          "email_owner_name_match",
          "Match score of user's name, provided by you and name associated with email. Range: (1-4). 1 means exact match",
        ],
        [
          "email_phone_risk_level",
          "Phone risk level from Email Intelligence provider. Range: (1-3) and 6. 1 means very high risk and 6 means invalid phone",
        ],
        [
          "billaddress_reason",
          "Billing address risk value. Range: (1-3) and 6. 1 means high risk and 6 means incomplete billing address",
        ],
      ],
    },
    {
      key: KEY_CARD_DETAILS,
      type: "list",
      component: (
        <CardContentOrLoadingOrNoData
          isLoading={isLoading}
          hasData={transactionData.length > 0}
          name={KEY_CARD_DETAILS}
          tableBodyElements={cardData.map((c) => (
            <TableBodyOther c={c} key={c.last4} />
          ))}
        />
      ),
    },
    {
      key: KEY_BANK_DETAILS,
      type: "list",
      component: (
        <CardContentOrLoadingOrNoData
          isLoading={isLoading}
          hasData={bankData.length > 0}
          name={KEY_BANK_DETAILS}
          tableBodyElements={bankData.map((b) => (
            <TableBodyBank b={b} key={`${b.account_number}_${b.routing_number}`} />
          ))}
        />
      ),
    },
    {
      key: KEY_TRANSACTIONS,
      type: "list",
      component: (
        <CardContentOrLoadingOrNoData
          isLoading={isLoading}
          hasData={transactionData.length > 0}
          name={KEY_TRANSACTIONS}
          tableBodyElements={transactionData.map((t) => (
            <TableBodyTransactions t={t} key={Object.values(t).join("_")} />
          ))}
        />
      ),
    },
    {
      key: KEY_CRYPTO_ADDRESSES,
      type: "list",
      component: (
        <CardContentOrLoadingOrNoData
          isLoading={isLoading}
          hasData={cryptoData.length > 0}
          name={KEY_CRYPTO_ADDRESSES}
          tableBodyElements={cryptoData.map((c) => (
            <TableBodyCrypto c={c} key={`${c.address}_${c.addressRiskScore}`} />
          ))}
        />
      ),
    },
  ]);

  useEffect(() => {
    async function fetchBankData(customerId: string) {
      try {
        setLoadingTransactions(true);
        const { result } = await getCustomerBankDetails(customerId);
        setLoadingTransactions(false);

        if (Array(result).length > 0) {
          const resBank: BankObject[] = [];
          const bankFlags: boolean[] = [];

          result.forEach((r: AnyTodo) => {
            if (!bankFlags[r.account_number] && r.account_number) {
              bankFlags[r.account_number] = true;
              resBank.push({
                account_number: r.account_number || "-",
                routing_number: r.routing_number || "-",
                account_type: r.account_type || "-",
                balance: r.balance || "-",
                balance_currency: r.balance_currency || "-",
                total_amount_spent: r.total_amount_spent || "-",
              });
            }
          });

          setBankData(dedupeBankObjects(resBank));
        }
      } catch (error) {
        captureException(error);
      }
    }

    function setDSTransactionsData(transactions: Array<Transaction>) {
      setTransactionData(transactions.map((t) => buildTransactionObject(t, "")));
      const cardDataVal = transactions
        .filter((transaction) => transaction.payment_method === "card")
        .map((t) => buildCardObject(t, ""));
      setCardData(dedupeCardObjects(cardDataVal));

      const bankDataVal = transactions.filter((transaction) => transaction.payment_method === "bank").map(buildBankObject);
      setBankData(dedupeBankObjects(bankDataVal));

      const cryptoDataVal = transactions
        .filter(
          (transaction) =>
            transaction.crypto_address !== undefined || transaction.recipient_payment_method_crypto?.crypto_address !== undefined
        )
        .map(buildCryptoObject)
        .flat();
      setcryptoData(dedupeCryptoObjects(cryptoDataVal));
    }

    async function fetchCardData(customerId: string) {
      try {
        setLoadingCards(true);
        const { result } = await getCustomerCardDetails(customerId);
        setLoadingCards(false);

        if (Array(result).length > 0) {
          const resCards: CardObject[] = [];

          result.forEach((r: AnyTodo) => {
            resCards.push({
              card_type: getCardType(r.card_type || 0),
              issuer_brand: r.issuer_brand || "-",
              issuer_icon: getIssuerIcon(r.issuer_brand || ""),
              is_prepaid: `${r.is_prepaid || false}`,
              card_category: r.card_category || "-",
              last4: r.last4 || "-",
              first6: r.first6 || "-",
              isRelevantToSession: false,
            });
          });

          setCardData(dedupeCardObjects(resCards));
        }
      } catch (error) {
        captureException(error);
      }
    }

    async function fetchCryptoData(customerId: string) {
      try {
        setloadingCrypto(true);
        const { result } = await getCustomerCryptoDetails(customerId);
        setloadingCrypto(false);

        if (Array(result).length > 0) {
          const resCards: CryptoObject[] = [];

          result.forEach((r: AnyTodo) => {
            resCards.push({
              currency_code: r.currency_code || "-",
              address: r.address || "-",
              userRiskScore: r.addressRiskScore || "-",
              addressRiskScore: r.addressRiskScore || "-",
              categories: r.categories || "-",
            });
          });

          setcryptoData(dedupeCryptoObjects(resCards));
        }
      } catch (error) {
        captureException(error);
      }
    }

    async function fetchCustomerData() {
      if (cusId.length > 0) {
        try {
          let val: CustomersResponse | null = null;

          const result = await getCustomerProfile(cusId, clientId);
          setCustomerProfile(result);

          const { sessions, transactions } = result;
          if (sessions.length > 0) {
            val = convertDatastoreSessionsToCustomerResponse(sessions);
          }
          setDSTransactionsData(transactions.transactions);

          if (val !== null) {
            setCustomerData(val);
            Promise.all([fetchBankData(cusId), fetchCardData(cusId), fetchCryptoData(cusId)]).catch(captureException);
          } else {
            setCustomerNotFound(true);
          }
        } catch (error) {
          captureException(error);
        }
      }
    }

    if (!customerData) {
      fetchCustomerData().catch(captureException);
    }
  }, [clientId, customerData, cusId]);

  const renderCustomerData = () => (
    <StyledMainDiv>
      <StyledStickyNav
        id="device-info"
        style={{
          width: "inherit",
          margin: 10,
          justifyContent: "space-between",
          display: "flex",
        }}
      >
        <StyledNavTitle style={{ width: "100%" }}>
          <StyledTitleName id="page_title" style={{ fontSize: 14, fontWeight: "bold" }}>
            {"Customers > Details"}
          </StyledTitleName>
        </StyledNavTitle>
        {customerData ? (
          <Button
            id="blocklist_button"
            variant="outline-primary"
            style={{ height: 40, marginRight: 15, marginTop: 10, width: 190 }}
            onClick={() => {
              setShowPopUp(true);
            }}
          >
            Blocklist/Allowlist
          </Button>
        ) : null}
      </StyledStickyNav>
      <InputGroupWrapper style={{ width: "inherit" }}>
        <div style={{ width: "100%", margin: "10px 10px" }}>
          <DetailsHeaderParent>
            <DetailsHeaderChild>
              <DetailsHeaderTile id="user_id_title">Customer Id</DetailsHeaderTile>
              <DetailsHeaderValue id="user_id_value"> {customerData?.customer_id || "-"} </DetailsHeaderValue>
            </DetailsHeaderChild>
            <DetailsHeaderChild>
              <DetailsHeaderTile id="customer_name_title">Customer Name</DetailsHeaderTile>
              <DetailsHeaderValue id="customer_name_value">
                {" "}
                <BulletView data={customerData?.first_name || ""} />{" "}
              </DetailsHeaderValue>
            </DetailsHeaderChild>
            <DetailsHeaderChild>
              <DetailsHeaderTile id="customer_risk_level_title">Customer RiskLevel</DetailsHeaderTile>
              <DetailsHeaderValue id="customer_risk_level_value">
                {" "}
                <Badge title={customerData?.customer_risk_level || "unknown"} />{" "}
              </DetailsHeaderValue>
            </DetailsHeaderChild>
            <DetailsHeaderChild>
              <DetailsHeaderTile id="customer_risk_reason_codes_title">Customer Risk ReasonCodes</DetailsHeaderTile>
              <DetailsHeaderValue id="customer_risk_reason_codes_value">
                {" "}
                {renderReasonCodesFromArray(customerData?.reason_codes || [])}{" "}
              </DetailsHeaderValue>
            </DetailsHeaderChild>
          </DetailsHeaderParent>
        </div>
      </InputGroupWrapper>
      <br />
      <Tabs
        defaultActiveKey="overview"
        onSelect={(eventKey) => {
          setSelectedTab(eventKey || "");
        }}
      >
        <Tab
          eventKey="overview"
          title={
            <DetailsHeaderTile
              id="overview_tab"
              style={{ fontWeight: 600, color: selectedTab === "overview" ? "var(--dark-14)" : "GrayText" }}
            >
              Overview
            </DetailsHeaderTile>
          }
        >
          <PinContainer style={{ marginBottom: 30 }}>
            {cardsData.map((data) => (
              <TableCardSection key={data.key} data={data} customerData={customerData} />
            ))}
          </PinContainer>
        </Tab>
        <Tab
          eventKey="network"
          title={
            <DetailsHeaderTile
              id="network_tab"
              style={{ fontWeight: 600, color: selectedTab === "network" ? "var(--dark-14)" : "GrayText" }}
            >
              Network
            </DetailsHeaderTile>
          }
        >
          {selectedTab === "network" ? (
            <div
              style={{
                width: "100%",
                height: window.screen.height,
                marginTop: 10,
              }}
            >
              <UserNetwork organisation={organisation} userId={cusId} clientId={clientId} />
            </div>
          ) : (
            <div />
          )}
        </Tab>
      </Tabs>
    </StyledMainDiv>
  );

  return (
    <Layout>
      <AccessControlPopUp
        show={showPopUp && customerData !== undefined}
        client_id={customerData ? customerData.client_id : ""}
        handleClose={() => {
          setShowPopUp(false);
        }}
        handleSuccess={(isBL) => {
          setShowPopUp(false);
          addToast(`${isBL ? "Blocklisted" : "Allowlisted"} successfully`, {
            appearance: "info",
            autoDismiss: true,
          });
        }}
        data={customerData}
      />
      {customerNotFound ? renderCustomerNotFound(cusId) : customerData ? renderCustomerData() : <Loader />}
    </Layout>
  );
};

export default CustomerProfile;
