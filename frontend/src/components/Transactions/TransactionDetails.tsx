import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import back_blue from "utils/logo/back_blue.svg";
import { fetchTransactionDetails } from "utils/api";
import {
  indemnificationDecisionFromValue,
  KEY_EXECUTED_RULES,
  KEY_IDENTITY,
  KEY_PAYMENT_METHOD,
  KEY_TRANSACTION_DATA,
  Transaction as TransactionResponse,
} from "sardine-dashboard-typescript-definitions";
import Loader from "components/Common/Loader";
import DataCard, { CardAttribute } from "components/Common/DataCard";
import ExecutedRulesList from "components/Common/ExecutedRulesList";
import moment from "moment";
import { RULE_DETAILS_PATH, SEARCH_PARAM_KEYS, TRANSACTIONS_PATH } from "modulePaths";
import { replaceAll } from "utils/stringUtils";
import { captureException } from "utils/errorUtils";
import {
  isCardElement,
  isTableCardCustomerData,
  isTableCardListData,
  TableCardData,
} from "components/Customers/UserView/TableCard";
import { DetailsHeaderChild, DetailsHeaderParent, DetailsHeaderTile, DetailsHeaderValue } from "components/Customers/styles";
import { CustomerProfileLink } from "components/Common/Links";
import mccArray from "./mcc_codes.json";
import { StyledMainDiv, StyledContainer, HorizontalContainer, StyledChildren, PinContainer, InputGroupWrapper } from "./styles";
import { StyledNavTitle, StyledStickyNav, StyledTitleName } from "../Dashboard/styles";
import Layout from "../Layout/Main";
import { DATE_FORMATS, TIME_UNITS } from "../../constants";
import { formatTimestampInUtc } from "../../utils/timeUtils";

const PARAM_KEYS = SEARCH_PARAM_KEYS[RULE_DETAILS_PATH];
interface StateData {
  data: TransactionResponse;
}

const prepareCardAttributes = (data: ObjectConstructor, parentKey: string, descriptions: string[][]) => {
  const output: CardAttribute[] = [];
  Object.keys(data)
    .sort()
    .forEach((key) => {
      const k = replaceAll(key, ".", " ");
      const d = Object(data)[key];
      const desc = descriptions.filter((d) => d.includes(key));
      if (typeof d === "object") {
        output.push(...prepareCardAttributes(Object(d), k, descriptions));
      } else {
        output.push({
          key: parentKey !== "" ? `${parentKey}-${k}` : k,
          value: d || "-",
          toolTip: desc.length > 0 ? desc[0][1] : undefined,
        });
      }
    });

  return output;
};

const getMccText = (code: string) => {
  const codeObject = mccArray.find((mccItem) => mccItem.mcc === code);
  if (codeObject) return `${codeObject.mcc} (${codeObject.usda_description.replace(/\s+/g, "")})`;
  return code;
};

const TransactionData: React.FC<{ attributes: CardAttribute[]; cardsData: TableCardData[] }> = (props) => {
  const { attributes, cardsData } = props;
  if (attributes) {
    const objects: JSX.Element[] = cardsData.map((card) => (
      <DataCard
        key={card.key}
        header={card.key.toUpperCase()}
        bodyStyle={card.type === "list" ? { display: "block" } : {}}
        attributes={attributes.filter((a) => isTableCardCustomerData(card) && card.value && card.value.flat().includes(a.key))}
      >
        {isTableCardListData(card) ? card.component : <div />}
      </DataCard>
    ));
    return <div>{objects}</div>;
  }

  return <div />;
};

const TransactionDetails = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const [transactionData, setTransactionData] = useState<TransactionResponse>();
  const [isTransactionDataLoaded, setIsTransactionDataLoaded] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { addToast } = useToasts();

  const [params] = useSearchParams();
  const stateData = location.state as StateData;

  const transactionId = params.get("transactionId") || "";
  const clientId = params.get("clientId") || "";

  const cardsData: TableCardData[] = [
    {
      key: KEY_TRANSACTION_DATA,
      type: "card",
      value: [
        ["currency_code", "3-digit ISO 4217 currency code"],
        [
          "action_type",
          "Indicates the type of transaction: buy, sell, deposit, withdraw, refund, payment, and topup. If you need other action type to be supported, please reach out sardine team.",
        ],
        ["amount", "Amount of transaction"],
        ["date_time", "Date time of the transaction"],
        ["item_category", "Main item category in cart. e.g. crypto asset(ETH, BTC), gift card, alcohol, generic"],
        ["indemnification_decision", "Whether transaction is approved. approved, conditionally_approved, rejected or unknown"],
        ["indemnification_reason", "Reason for indemnification"],
        ["categories", ""],
      ],
    },
    {
      key: KEY_EXECUTED_RULES,
      type: "list",
      component: (
        <ExecutedRulesList
          sessionKey={transactionData?.session_key || ""}
          date={formatTimestampInUtc(transactionData?.created_milli || 0, {
            unit: TIME_UNITS.MILLISECOND,
            format: DATE_FORMATS.DATE,
          })}
          clientID={clientId}
          onClick={(id: string) =>
            navigate(`${RULE_DETAILS_PATH}?${PARAM_KEYS.RULE_ID}=${id}&${PARAM_KEYS.CLIENT_ID}=${clientId}`)
          }
        />
      ),
    },
    {
      key: KEY_PAYMENT_METHOD,
      type: "card",
      value: [
        ["payment_method", "Payment method"],
        ["mcc", "mcc (merchant category code) for this transaction"],
        ["card_hash", "Sha-256 hash of card number(PAN)"],
        ["first_6", "First 6 digit of card number"],
        ["last_4", "Last 4 digit of card number"],
        ["routing_number", "bank routing number"],
        ["account_number", "bank account number"],
        ["crypto_address", "crypto address"],
        ["address_risk_level", "Address risk level"],
        ["crypto_currency_code", "currency code or symbol such as BTC or ETH"],
        ["recipient_payment_method", "Recipient payment method"],
      ],
    },
    {
      key: KEY_IDENTITY,
      type: "card",
      value: [
        ["risk_level", "Risk at overall level: very_high, high, medium, low"],
        ["aml_level", "aml risk level"],
      ],
    },
  ];

  const fetchTransactionData = useCallback(async () => {
    if (clientId.length > 0 && transactionId.length > 0) {
      try {
        setIsTransactionDataLoaded(false);
        const { data } = await fetchTransactionDetails(clientId, {
          transaction_id: transactionId,
          load_transactions: false,
        });

        if (data !== null) {
          setTransactionData({
            ...data,
            mcc: getMccText(data.mcc),
            date_time: moment(data.created_milli || 0).format(DATE_FORMATS.DATETIME),
            indemnification_decision: indemnificationDecisionFromValue(data.indemnification_decision),
          });
        } else {
          addToast("Failed to load details!", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (error) {
        captureException(error);
        addToast(`Failed to load details: ${error}`, {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setIsDataLoaded(true);
        setIsTransactionDataLoaded(true);
      }
    }
  }, [addToast, transactionId, clientId]);

  useEffect(() => {
    if (!isDataLoaded) {
      setIsDataLoaded(true);
      if (stateData && stateData.data) {
        setTransactionData({
          ...stateData.data,
          indemnification_decision: indemnificationDecisionFromValue(stateData.data.indemnification_decision),
        });
        setIsTransactionDataLoaded(true);
      } else {
        fetchTransactionData().catch(captureException);
      }
    }
  }, [isDataLoaded, stateData, fetchTransactionData]);

  return (
    <Layout>
      <StyledStickyNav style={{ width: "100%", marginBottom: 0, backgroundColor: "white" }}>
        <HorizontalContainer
          id="back_button"
          style={{
            color: "#2173FF",
            fontSize: 16,
            padding: 20,
            justifyContent: "start",
          }}
          onClick={() => navigate(`${TRANSACTIONS_PATH}`)}
        >
          <img alt="back" src={back_blue} style={{ width: 20, marginLeft: 30 }} />
          Back to Transaction Intelligence?
        </HorizontalContainer>
      </StyledStickyNav>

      <StyledChildren>
        {isDataLoaded && isTransactionDataLoaded ? (
          <StyledMainDiv
            style={{
              backgroundColor: "#FFF",
              width: "100%",
              height: "90vh",
              margin: 0,
              overflowY: "scroll",
            }}
          >
            <StyledNavTitle style={{ width: "100%", marginLeft: 30 }}>
              <StyledTitleName
                id="page_title"
                style={{
                  fontSize: 32,
                  fontWeight: "normal",
                  paddingTop: 20,
                }}
              >
                Transaction details
                <StyledTitleName
                  id="page_subtitle"
                  style={{
                    fontSize: 14,
                    fontWeight: "normal",
                    color: "#B9C5E0",
                    marginTop: 10,
                  }}
                >
                  {`Details for the transaction: ${transactionData?.id || ""}`}
                </StyledTitleName>
              </StyledTitleName>
            </StyledNavTitle>
            <StyledContainer>
              <PinContainer style={{ marginBottom: 30 }}>
                <InputGroupWrapper>
                  <div style={{ width: "100%", margin: "10px 10px" }}>
                    <DetailsHeaderParent>
                      <DetailsHeaderChild>
                        <DetailsHeaderTile id="transaction_id_title">Transaction Id</DetailsHeaderTile>
                        <DetailsHeaderValue id="transaction_id_value">{transactionData?.id || "-"}</DetailsHeaderValue>
                      </DetailsHeaderChild>
                      <DetailsHeaderChild>
                        <DetailsHeaderTile id="session_key_title">Session Key</DetailsHeaderTile>
                        <DetailsHeaderValue id="session_key_value"> {transactionData?.session_key || "-"} </DetailsHeaderValue>
                      </DetailsHeaderChild>
                      <DetailsHeaderChild>
                        <DetailsHeaderTile id="user_id_title">Customer Id</DetailsHeaderTile>
                        <DetailsHeaderValue id="user_id_value">
                          {transactionData?.customer_id ? (
                            <CustomerProfileLink
                              clientId={transactionData?.client_id || ""}
                              customerId={transactionData?.customer_id || ""}
                              text={transactionData?.customer_id || ""}
                            />
                          ) : (
                            "-"
                          )}
                        </DetailsHeaderValue>
                      </DetailsHeaderChild>
                    </DetailsHeaderParent>
                  </div>
                </InputGroupWrapper>
                {transactionData && (
                  <TransactionData
                    attributes={prepareCardAttributes(
                      Object(transactionData),
                      "",
                      cardsData
                        .map((c) =>
                          isTableCardCustomerData(c)
                            ? c.value.map((cardKeyValue) =>
                                isCardElement(cardKeyValue) ? [cardKeyValue.key, cardKeyValue.description] : cardKeyValue
                              )
                            : []
                        )
                        .flat()
                    )}
                    cardsData={cardsData}
                  />
                )}
              </PinContainer>
            </StyledContainer>
          </StyledMainDiv>
        ) : (
          <Loader />
        )}
      </StyledChildren>
    </Layout>
  );
};

export default TransactionDetails;
