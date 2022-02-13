import { useEffect, useState, useMemo, useCallback, useRef, MutableRefObject, Dispatch, SetStateAction } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { AddToast, useToasts } from "react-toast-notifications";
import { Button, FormControl, Spinner } from "react-bootstrap";
import moment from "moment";
import {
  AmlKind,
  StatusData,
  Transaction as TransactionResponse,
  AnyTodo,
  CustomersResponse,
  SessionCustomKind,
  SOURCE_QUERY_FIELD,
  DATA_SOURCE,
  GetFeedbacksResponse,
  isFailure,
  getSuccessResult,
  DeviceProfile,
} from "sardine-dashboard-typescript-definitions";
import ExecutedRulesList from "components/Common/ExecutedRulesList";
import { AmlSection } from "components/Customers/UserView/AML";
import DataCard, { CardAttribute } from "components/Common/DataCard";
import {
  CUSTOMER_PROFILE_PATH,
  DEVICE_VIEW_PATH,
  RULE_DETAILS_PATH,
  TRANSACTION_DETAILS_PATH,
  SEARCH_PARAM_KEYS,
} from "modulePaths";
import DeviceInfo from "components/Common/Customer/DeviceInfo";
import PaymentMethod from "components/Common/Customer/PaymentMethod";
import { useUserStore } from "store/user";
import { CLIENT_ID_QUERY_FIELD } from "utils/constructFiltersQueryParams";
import Layout from "../components/Layout/Main";
import { StyledNavTitle, StyledStickyNav, StyledTitleName } from "../components/Dashboard/styles";
import { captureException, captureFailure } from "../utils/errorUtils";
import {
  StyledMainDiv,
  DetailsHeaderParent,
  DetailsHeaderChild,
  StyledContainer,
  HorizontalContainer,
  StyledDrawer,
  StyledMenuDiv,
  StyledMainContentDiv,
  StyledChildren,
  PinContainer,
  Container,
  StyledUserPhoto,
  StyledLink,
  HandleOverflowDiv,
} from "../components/Queues/styles";
import back_blue from "../utils/logo/back_blue.svg";
import comments from "../utils/logo/comments.svg";
import {
  addNewComment,
  getQueueCommentslist,
  getCustomerWithTransactionDetails,
  updateCaseStatus,
  getAmlData,
  getFeedbacks,
} from "../utils/api";
import { actions, ActionsDropDown } from "../components/Queues/Components/ActionPopup";
import Badge from "../components/Common/Badge";
import AccessControlPopUp from "../components/Customers/UserView/AccessControlPopUp";
import { getRandomColor, timeDifferenceFromNow } from "../components/Common/Functions";
import { SubmitButton } from "../components/Common/Components";
import CommentList, { ICommentProps } from "../components/Queues/Components/CommentList";
import {
  convertDatastoreSessionToCustomerResponse,
  getLatestAddressFromCustomerResponse,
  getLatestMapUrlFromCustomerResponse,
} from "../utils/customerSessionUtils";
import CustomerDetails from "../components/Common/Customer/CustomerDetails";
import CustomerLocation from "../components/Common/Customer/CustomerLocation";
import CustomerPhone from "../components/Common/Customer/CustomerPhone";
import CustomerEmail from "../components/Common/Customer/CustomerEmail";
import CustomerTaxDetails from "../components/Common/Customer/CustomerTaxDetails";
import Transaction from "../components/Common/Transaction";
import { KEY_EXECUTED_RULES } from "../constants";
import { useDeviceProfileFetchResult } from "../hooks/fetchHooks";
import FeedbackPopUp from "../components/Customers/UserView/FeedbackPopUp";
import FeedbackList from "../components/Queues/Components/FeedbackList";

const PARAM_KEYS = SEARCH_PARAM_KEYS[RULE_DETAILS_PATH];

const myCommentColor = getRandomColor();
const KEY_AML_ANTI_MONEY_LAUNDERING = "AML (Anti Money Laundering)" as const;
const KEY_SESSION_CUSTOM = "Custom" as const;

const UNKNOWN_LABEL = "unknown";

const TransactionDetails = ({
  dataLoaded,
  transaction,
}: {
  dataLoaded: boolean;
  transaction: TransactionResponse | undefined;
}): JSX.Element => {
  if (dataLoaded && transaction !== undefined) {
    return (
      <Transaction
        amount={transaction.amount}
        currenyCode={transaction.currency_code}
        itemCategory="USD"
        createdAtMillis={transaction.created_milli}
        actionType={transaction.action_type}
        paymentType={transaction.payment_method}
      />
    );
  }
  return <div />;
};

const CustomView = ({ custom }: { custom?: SessionCustomKind }) => {
  const attributes: CardAttribute[] =
    custom === undefined ? [] : Object.keys(custom).map((key) => ({ key, value: custom[key], toolTip: key }));

  if (attributes.length) {
    return <DataCard header={KEY_SESSION_CUSTOM} attributes={attributes} />;
  }
  return null;
};

const CommentsView = ({
  addToast,
  commentsRef,
  sessionKey,
  setCommentsData,
  clientId,
  commentsData,
  isLoadingComments,
}: {
  addToast: AddToast;
  commentsRef: MutableRefObject<null>;
  sessionKey: string;
  setCommentsData: Dispatch<SetStateAction<ICommentProps[] | undefined>>;
  clientId: string;
  commentsData: ICommentProps[] | undefined;
  isLoadingComments: boolean;
}): JSX.Element => {
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const { id, name, email } = useUserStore(({ id, name, email }) => ({ id, name, email }));
  const addComment = async () => {
    try {
      setAddingComment(true);
      const result = await addNewComment({
        sessionKey,
        comment: commentText,
        owner_id: id || "",
        clientId,
      });
      setAddingComment(false);

      if (result.length > 0) {
        setCommentsData([
          {
            id: result,
            comment: commentText,
            time: timeDifferenceFromNow(moment.now()),
            color: getRandomColor(),
            owner: {
              id: id || "",
              email: email || "",
              name: name || "-",
            },
          },
          ...(commentsData || []),
        ]);

        setCommentText("");
      } else {
        setAddingComment(false);
        addToast(`Failed to add comment, Please try again!`, {
          appearance: "error",
          autoDismiss: false,
        });
      }
    } catch (error) {
      setAddingComment(false);
      addToast(`${error}`, {
        appearance: "error",
        autoDismiss: false,
      });
      Sentry.captureException(error);
    }
  };

  return (
    <Container ref={commentsRef} style={{ marginBottom: 40 }}>
      <StyledTitleName style={{ fontSize: 32, fontWeight: "normal", paddingTop: 20 }}>Comments</StyledTitleName>

      <HorizontalContainer style={{ paddingTop: 40, alignItems: "flex-start" }}>
        <StyledUserPhoto style={{ backgroundColor: myCommentColor }}>{name?.slice(0, 1)}</StyledUserPhoto>
        <Container style={{ width: "-webkit-fill-available" }}>
          <FormControl
            as="textarea"
            placeholder="Add a comment..."
            value={commentText}
            style={{
              marginLeft: 20,
              backgroundColor: "#F0F3F9",
              borderRadius: 16,
              minHeight: commentText.trim().length > 0 ? 110 : 55,
              transition: "min-height 0.15s ease-out",
              border: commentText.trim().length > 0 ? "1px solid #2173FF" : "none",
              color: "#325078",
              fontSize: 16,
            }}
            onChange={(event) => {
              setCommentText(event.target.value);
            }}
          />
          {commentText.trim().length > 0 ? (
            <>
              <SubmitButton
                style={{ margin: "15px", width: 100 }}
                title="Submit"
                isLoading={addingComment}
                onClick={addComment}
              />
              <SubmitButton
                style={{
                  backgroundColor: "transparent",
                  color: "#325078",
                  width: 100,
                }}
                title="Cancel"
                onClick={() => {
                  setCommentText("");
                }}
              />
            </>
          ) : null}
        </Container>
      </HorizontalContainer>

      <CommentList isLoadingComments={isLoadingComments} data={commentsData} />
    </Container>
  );
};

const LinkElem = ({ text, path }: { text: string; path: string }): JSX.Element => {
  const linkEnabled = text !== "";
  return (
    <HandleOverflowDiv>
      {linkEnabled ? (
        <StyledLink to={path} target="_blank">
          {text}
        </StyledLink>
      ) : (
        UNKNOWN_LABEL
      )}
    </HandleOverflowDiv>
  );
};

const DetailsHeader = ({ name, childElement }: { name: string; childElement: JSX.Element }): JSX.Element => (
  <DetailsHeaderChild>
    <StyledTitleName
      style={{
        fontSize: 16,
        fontWeight: "bold",
        textTransform: "capitalize",
        wordBreak: "break-all",
      }}
    >
      {name}
    </StyledTitleName>
    {childElement}
  </DetailsHeaderChild>
);

const SessionsDetails = (): JSX.Element => {
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState<CustomersResponse>();
  const [transactionData, setTransactionData] = useState<TransactionResponse>();
  const [isTransactionDataLoaded, setIsTransactionDataLoaded] = useState(false);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAccessControlPopUp, setShowAccessControlPopUp] = useState(false);
  const [showFeedbackPopUp, setShowFeedbackPopUp] = useState(false);
  const [actionsValue, setActionsValue] = useState<string[]>(Array(actions.length).fill(""));

  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [commentsData, setCommentsData] = useState<ICommentProps[]>();
  const [amlData, setAmlData] = useState<AmlKind>();
  const [isLoadingAmlData, setIsLoadingAmlData] = useState(false);
  const [deviceData, setDeviceData] = useState<DeviceProfile>();
  const [feedbackData, setFeedbackData] = useState<GetFeedbacksResponse>([]);
  const [isLoadingFeedbackData, setIsLoadingFeedbackData] = useState(false);

  const [custom, setCustom] = useState<SessionCustomKind>();

  const { addToast } = useToasts();

  const commentsRef = useRef(null);

  const [params] = useSearchParams();

  const sessionKey = params.get("sessionKey") || "";
  const cusId = params.get("customerId") || "";
  const clientId = params.get("client_id") || "";
  const checkpoint = params.get("checkpoint") || "customer";
  const queue = params.get("queue") || "";

  const { orgName } = useUserStore(({ organisation: org }) => ({
    orgName: org || "all",
  }));

  const deviceProfileFetchResult = useDeviceProfileFetchResult({ sessionKey, orgName, enabled: sessionKey !== "", clientId });

  useEffect(() => {
    if (deviceProfileFetchResult.data !== undefined) {
      const { hits, profile } = deviceProfileFetchResult.data;
      // eslint-disable-next-line no-underscore-dangle
      if (profile) {
        setDeviceData(profile);
      } else if (hits && hits.hits) {
        const deviceProfileList = hits.hits.map((item) => item._source);
        if (deviceProfileList.length > 0) {
          const deviceProfile = deviceProfileList[0];
          setDeviceData(deviceProfile);
        }
      }
    }
  }, [deviceProfileFetchResult.data]);

  useEffect(() => {
    if (deviceProfileFetchResult.error !== null) {
      addToast(deviceProfileFetchResult.error.message, {
        appearance: "error",
      });
    }
  }, [deviceProfileFetchResult.error]);

  const fetchCustomerData = useCallback(async () => {
    if (sessionKey.length > 0) {
      try {
        const { session, transactions } = await getCustomerWithTransactionDetails(cusId, sessionKey, clientId);

        if (session !== null) {
          setCustom(session.custom);

          const val = convertDatastoreSessionToCustomerResponse(session);
          setCustomerData(val);
          actions.forEach((a, ind) => {
            const v = Object.entries(val).filter((f) => f[0] === a.key);
            if (v.length > 0) {
              const actionVal = actionsValue;
              // eslint-disable-next-line prefer-destructuring
              actionVal[ind] = v[0][1];
              setActionsValue(actionVal);
            }
          });

          setIsDataLoaded(true);
        } else {
          addToast("Failed to load details for the sessoin!", {
            appearance: "error",
            autoDismiss: false,
          });
        }

        if (transactions !== null && transactions.length > 0) {
          setTransactionData(transactions[0]);
          setIsTransactionDataLoaded(true);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }, [addToast, cusId, sessionKey, clientId, actionsValue]);

  const fetchComments = useCallback(async () => {
    if (sessionKey.length > 0) {
      try {
        setIsLoadingComments(true);
        const data = await getQueueCommentslist(clientId || "", sessionKey);
        setIsLoadingComments(false);

        const result: ICommentProps[] =
          data.length > 0
            ? data
                .map((d: AnyTodo) => ({
                  ...d,
                  time: timeDifferenceFromNow(parseInt(d.timestamp, 10)),
                  color: getRandomColor(),
                }))
                .sort((a: AnyTodo, b: AnyTodo) => parseInt(b.timestamp || "0", 10) - parseInt(a.timestamp || "0", 10))
            : [];

        setCommentsData(result);
      } catch (error) {
        setIsLoadingComments(false);
        addToast(`${error}`, {
          appearance: "error",
          autoDismiss: false,
        });
        Sentry.captureException(error);
      }
    }
  }, [addToast, sessionKey, clientId]);

  const fetchAmlData = useCallback(async () => {
    if (!cusId || !clientId || !sessionKey) {
      return;
    }
    try {
      setIsLoadingAmlData(true);
      const { aml } = await getAmlData(cusId, clientId, sessionKey);
      setAmlData(aml);
    } catch (error) {
      captureException(error);
    } finally {
      setIsLoadingAmlData(false);
    }
  }, [cusId, clientId, sessionKey]);

  const fetchFeedbackData = useCallback(async () => {
    if (!sessionKey) return;

    setIsLoadingFeedbackData(true);
    try {
      const res = await getFeedbacks(sessionKey);
      if (isFailure(res)) {
        captureFailure(res);
        return;
      }
      const feedbacks = getSuccessResult(res) || [];
      setFeedbackData(feedbacks);
    } catch (e) {
      captureException(e);
    } finally {
      setIsLoadingFeedbackData(false);
    }
  }, [sessionKey]);

  // TODO: Make it a useXXXFetchResult.
  useEffect(() => {
    if (!isDataLoaded) {
      Promise.all([fetchCustomerData(), fetchComments(), fetchAmlData(), fetchFeedbackData()]).then().catch(captureException);
    }
  }, [isDataLoaded, fetchCustomerData, fetchComments, fetchAmlData, fetchFeedbackData]);

  const updateCaseData = async () => {
    const data: StatusData = {};
    actions.forEach((a, ind) => {
      data[a.key] = actionsValue[ind];
    });

    try {
      setIsLoadingActions(true);
      const updated = await updateCaseStatus(
        [cusId],
        [sessionKey],
        clientId,
        data,
        checkpoint,
        [customerData?.transaction_id || ""],
        queue
      );
      if (updated) {
        setActionsValue(actionsValue);

        addToast("Case status updated", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast(`${error}`, {
        appearance: "error",
        autoDismiss: true,
      });
      Sentry.captureException(error);
    } finally {
      setIsLoadingActions(false);
    }
  };

  const customerDetailsPath = `${CUSTOMER_PROFILE_PATH}?clientId=${clientId}&customerId=${encodeURIComponent(
    customerData?.customer_id || ""
  )}`;
  const transactionDetailsPath = `${TRANSACTION_DETAILS_PATH}?clientId=${clientId}&transactionId=${
    customerData?.transaction_id || ""
  }`;
  const deviceDetailsPath = `${DEVICE_VIEW_PATH}?session=${customerData?.session_key || ""}&${SOURCE_QUERY_FIELD}=${
    DATA_SOURCE.DATASTORE
  }&${CLIENT_ID_QUERY_FIELD}=${encodeURIComponent(clientId)}`;

  const detailsHeaders = useMemo(
    () =>
      customerData === undefined
        ? []
        : [
            <DetailsHeader
              name="Session Key"
              key="session_key"
              childElement={<LinkElem text={customerData.session_key} path={deviceDetailsPath} />}
            />,

            <DetailsHeader
              name="Customer Id"
              key="customer_id"
              childElement={<LinkElem text={customerData.customer_id} path={customerDetailsPath} />}
            />,
            <DetailsHeader
              name="Transaction Id"
              key="transaction_id"
              childElement={<LinkElem text={customerData.transaction_id} path={transactionDetailsPath} />}
            />,

            <DetailsHeader
              name="Risk Level"
              key="risk_level"
              childElement={<Badge title={customerData.risk_level || UNKNOWN_LABEL} />}
            />,
            <DetailsHeader
              name="Customer Risk Level"
              key="customer_risk_level"
              childElement={<Badge title={customerData.customer_risk_level || UNKNOWN_LABEL} />}
            />,
            <DetailsHeader
              name="Device Risk Level"
              key="device_risk_level"
              childElement={<Badge title={deviceData?.session_risk || UNKNOWN_LABEL} />}
            />,
          ],
    [customerData, customerDetailsPath, transactionDetailsPath, deviceDetailsPath, deviceData]
  );

  return (
    <Layout>
      <AccessControlPopUp
        show={showAccessControlPopUp && customerData !== undefined}
        client_id={customerData ? customerData.client_id : ""}
        handleClose={() => {
          setShowAccessControlPopUp(false);
        }}
        handleSuccess={(isBL) => {
          setShowAccessControlPopUp(false);
          addToast(`${isBL ? "Blocklisted" : "Allowlisted"} successfully`, {
            appearance: "info",
            autoDismiss: true,
          });
        }}
        data={customerData}
      />
      {customerData?.transaction_id ? (
        <FeedbackPopUp
          show={showFeedbackPopUp}
          handleClose={() => {
            setShowFeedbackPopUp(false);
          }}
          handleSuccess={(feedback) => {
            setShowFeedbackPopUp(false);
            addToast("Feedback successfully", {
              appearance: "info",
              autoDismiss: true,
            });
            setFeedbackData([feedback]);
          }}
          data={{
            sessionKey: customerData.session_key,
            customerId: customerData.customer_id,
            transactionId: customerData.transaction_id,
          }}
        />
      ) : null}
      <StyledStickyNav style={{ width: "100%", marginBottom: 0, backgroundColor: "white" }}>
        <HorizontalContainer
          style={{
            padding: 20,
            justifyContent: "space-between",
          }}
        >
          <HorizontalContainer
            style={{
              color: "#2173FF",
              fontSize: 16,
              width: 120,
            }}
            onClick={() => navigate(-1)}
          >
            <img alt="back" src={back_blue} style={{ width: 20, marginLeft: 30 }} />
            Back
          </HorizontalContainer>
          <HorizontalContainer>
            <SubmitButton
              style={{ marginRight: 10, minWidth: 170 }}
              title="Blocklist/Allowlist"
              onClick={() => {
                setShowAccessControlPopUp(true);
              }}
            />
            {customerData?.transaction_id ? (
              <Button
                style={{
                  height: 45,
                  borderRadius: 12,
                  backgroundColor: "#F0F3F9",
                  border: "none",
                  minWidth: 170,
                  color: "#2173FF",
                  marginRight: 10,
                }}
                onClick={() => {
                  setShowFeedbackPopUp(true);
                }}
              >
                Provide Feedback
              </Button>
            ) : null}
            <Button
              style={{
                height: 45,
                borderRadius: 12,
                backgroundColor: "#F0F3F9",
                border: "none",
                minWidth: 170,
                color: "#2173FF",
              }}
              onClick={() => {
                if (commentsRef && commentsRef.current) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore: Object is possibly 'null'.
                  commentsRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {" "}
              <img alt="" src={comments} style={{ marginRight: 5 }} />
              Add comments{" "}
            </Button>
          </HorizontalContainer>
        </HorizontalContainer>
      </StyledStickyNav>

      <StyledMenuDiv>
        <StyledDrawer>
          <DetailsHeaderParent>
            {detailsHeaders}
            {customerData && customerData.queue_id && customerData.queue_id.length > 0 && (
              <DetailsHeaderChild>
                <ActionsDropDown
                  actionsValue={actionsValue}
                  onValuesUpdated={(arr) => {
                    setActionsValue(arr);
                  }}
                />
                <Button
                  style={{ width: 120, backgroundColor: "#2173FF", margin: "inherit" }}
                  disabled={actionsValue.filter((a) => a.length === 0).length > 0}
                  onClick={() => updateCaseData()}
                >
                  {isLoadingActions ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    <span>Submit</span>
                  )}
                </Button>
              </DetailsHeaderChild>
            )}
          </DetailsHeaderParent>
        </StyledDrawer>
        <StyledMainContentDiv>
          <StyledChildren>
            {isDataLoaded ? (
              <StyledMainDiv
                style={{
                  backgroundColor: "#FFF",
                  width: "100%",
                  height: "90vh",
                  margin: 0,
                  overflowY: "scroll",
                }}
              >
                <StyledNavTitle fixedHeight={false} style={{ width: "100%", marginLeft: 30 }}>
                  <StyledTitleName
                    style={{
                      fontSize: 32,
                      fontWeight: "normal",
                      paddingTop: 20,
                    }}
                  >
                    Session details
                    <StyledTitleName
                      style={{
                        fontSize: 14,
                        fontWeight: "normal",
                        color: "#B9C5E0",
                        marginTop: 10,
                      }}
                    >
                      <HandleOverflowDiv>{`Details associated with session key ${customerData?.session_key}`}</HandleOverflowDiv>
                    </StyledTitleName>
                  </StyledTitleName>
                </StyledNavTitle>
                <StyledContainer>
                  <PinContainer style={{ marginBottom: 30 }}>
                    <CustomerDetails
                      firstName={customerData?.first_name || ""}
                      lastName={customerData?.last_name || ""}
                      customerScore={customerData?.customer_score || ""}
                      emailAddress={customerData?.email_address || ""}
                      phone={customerData?.phone || ""}
                      carrier={customerData?.carrier || ""}
                      phoneCountry={customerData?.phone_country || ""}
                      dateOfBirth={customerData?.date_of_birth || ""}
                      timestamp={customerData?.timestamp || ""}
                      flow={customerData?.flow || ""}
                      isEmailVerified={customerData?.is_email_verified || false}
                      isPhoneVerified={customerData?.is_phone_verified || false}
                      facebookLink={customerData?.facebook_Link || ""}
                      twitterLink={customerData?.Twitter_Link || ""}
                      linkedInLink={customerData?.LinkedIn_Link || ""}
                      reasonCodes={customerData?.reason_codes || []}
                    />
                    <DataCard header={KEY_EXECUTED_RULES} attributes={[]} bodyStyle={{ display: "block" }}>
                      <ExecutedRulesList
                        executedRules={customerData?.rules_executed || []}
                        sessionKey={sessionKey}
                        date={customerData?.timestamp || ""}
                        clientID={customerData?.client_id || ""}
                        onClick={(id: string) => {
                          navigate(
                            `${RULE_DETAILS_PATH}?${PARAM_KEYS.RULE_ID}=${id}${
                              customerData?.client_id && `&${PARAM_KEYS.CLIENT_ID}=${customerData?.client_id}`
                            }`
                          );
                        }}
                      />
                    </DataCard>
                    {amlData && customerData && (
                      <DataCard header={KEY_AML_ANTI_MONEY_LAUNDERING} attributes={[]} bodyStyle={{ display: "block" }}>
                        <AmlSection customerData={customerData} isLoading={isLoadingAmlData} amlData={amlData} />
                      </DataCard>
                    )}
                    <CustomerLocation
                      address={customerData === undefined ? "" : getLatestAddressFromCustomerResponse(customerData)}
                      city={
                        customerData === undefined || customerData.address_fields_list.length === 0
                          ? ""
                          : customerData.address_fields_list[0].city
                      }
                      postalCode={
                        customerData === undefined || customerData.address_fields_list.length === 0
                          ? ""
                          : customerData.address_fields_list[0].postal_code
                      }
                      regionCode={
                        customerData === undefined || customerData.address_fields_list.length === 0
                          ? ""
                          : customerData.address_fields_list[0].region_code
                      }
                      countryCode={
                        customerData === undefined || customerData.address_fields_list.length === 0
                          ? ""
                          : customerData.address_fields_list[0].country_code
                      }
                      mapUrl={customerData === undefined ? "" : getLatestMapUrlFromCustomerResponse(customerData)}
                    />
                    <CustomerPhone
                      phoneLevel={customerData?.phone_level || ""}
                      phoneReasonCodes={customerData?.phone_reason_codes || ""}
                      phoneScoreReason={customerData?.phonescore_reason || ""}
                      nameScore={customerData?.name_score || ""}
                      addressScore={customerData?.address_score || ""}
                    />
                    <CustomerEmail
                      emailLevel={customerData?.email_level || ""}
                      emailDomainLevel={customerData?.email_domain_level || ""}
                      emailReasonCodes={customerData?.email_reason_codes || ""}
                      emailReason={customerData?.email_reason || ""}
                      emailOwnerName={customerData?.email_owner_name || ""}
                      emailOwnerNameMatch={customerData?.email_owner_name_match || ""}
                      emailPhoneRiskLevel={customerData?.email_phone_risk_level || ""}
                      riskBand={customerData?.risk_band || ""}
                      billaddressReason={customerData?.billaddress_reason || ""}
                    />
                    <CustomerTaxDetails
                      abuseScore={customerData?.abuse_score || 0}
                      firstPartySyntheticScore={customerData?.first_party_synthetic_score || 0}
                      idTheftScore={customerData?.id_theft_score || 0}
                      nameDobSharedCount={customerData?.name_dob_shared_count || 0}
                      nameSsnSyntheticAddress={customerData?.name_ssn_synthetic_address || false}
                      ssnBogus={customerData?.ssn_bogus || false}
                      ssnHistoryLongerMonths={customerData?.ssn_history_longer_months || 0}
                      ssnIssuanceBeforeDob={customerData?.ssn_issuance_before_dob || false}
                      ssnIssuanceDobMismatch={customerData?.ssn_issuance_dob_mismatch || false}
                      ssnSharedCount={customerData?.ssn_shared_count || 0}
                      ssnNamesExactMatch={customerData?.ssn_names_exact_match || []}
                      ssnPhonesExactMatch={customerData?.ssn_phones_exact_match || []}
                      ssnEmailsExactMatch={customerData?.ssn_emails_exact_match || []}
                      ssnDobsExactMatch={customerData?.ssn_dobs_exact_match || []}
                      taxId={customerData?.tax_id || ""}
                      taxIdLevel={customerData?.tax_id_level || ""}
                      taxIdMatch={customerData?.tax_id_match || ""}
                      taxIdNameMatch={customerData?.tax_id_name_match || ""}
                      taxIdDobMatch={customerData?.tax_id_dob_match || ""}
                      taxIdStateMatch={customerData?.tax_id_state_match || ""}
                      thirdPartySyntheticScore={customerData?.third_party_synthetic_score || ""}
                    />
                    <DeviceInfo
                      browser={deviceData?.browser}
                      deviceId={deviceData?.device_id}
                      deviceIp={deviceData?.ip_address}
                      emulator={deviceData?.emulator}
                      ipCity={deviceData?.city}
                      ipCountry={deviceData?.country}
                      ipRegion={deviceData?.region}
                      ipType={deviceData?.ip_type}
                      os={deviceData?.os}
                      proxy={deviceData?.proxy}
                      remoteDesktop={deviceData?.remote_software}
                      trueOs={deviceData?.true_os}
                      vpn={deviceData?.vpn}
                      location={deviceData?.location}
                    />
                    <PaymentMethod
                      accountNumber={transactionData?.account_number || ""}
                      cardHash={transactionData?.card_hash || ""}
                      first6={transactionData?.first_6 || ""}
                      last4={transactionData?.last_4 || ""}
                      mcc={transactionData?.mcc || ""}
                      paymentMethod={transactionData?.payment_method || ""}
                      recipientPaymentMethod={transactionData?.recipient_payment_method || ""}
                      routingNumber={transactionData?.routing_number || ""}
                      addressRiskLevel={transactionData?.address_risk_level || ""}
                      cryptoAddress={transactionData?.crypto_address || ""}
                      cryptoCurrencyCode={transactionData?.crypto_currency_code || ""}
                      cryptoCategories={transactionData?.categories || ""}
                      recipientAddressRiskLevel={transactionData?.recipient_payment_method_crypto?.address_risk_level || ""}
                      recipientCryptoAddress={transactionData?.recipient_payment_method_crypto?.crypto_address || ""}
                      recipientCryptoCategories={transactionData?.recipient_payment_method_crypto?.categories || ""}
                      recipientCryptoCurrencyCode={transactionData?.recipient_payment_method_crypto?.currency_code || ""}
                    />
                    <TransactionDetails dataLoaded={isTransactionDataLoaded} transaction={transactionData} />

                    {feedbackData && customerData && (
                      <DataCard header="Feedback" attributes={[]} bodyStyle={{ display: "block" }}>
                        <FeedbackList feedbacks={feedbackData} isLoading={isLoadingFeedbackData} />
                      </DataCard>
                    )}
                  </PinContainer>

                  <CustomView custom={custom} />
                  <CommentsView
                    addToast={addToast}
                    commentsRef={commentsRef}
                    sessionKey={sessionKey}
                    setCommentsData={setCommentsData}
                    clientId={clientId}
                    commentsData={commentsData}
                    isLoadingComments={isLoadingComments}
                  />
                </StyledContainer>
              </StyledMainDiv>
            ) : (
              <StyledTitleName
                style={{
                  textAlign: "center",
                  marginTop: 50,
                }}
              >
                Loading Details...
              </StyledTitleName>
            )}
          </StyledChildren>
        </StyledMainContentDiv>
      </StyledMenuDiv>
    </Layout>
  );
};

export default SessionsDetails;
