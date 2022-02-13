import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { RulePerformanceKind, RULE_ENV_MODES, RuleProps } from "sardine-dashboard-typescript-definitions";
import { useToggle } from "hooks/useToggle";
import { useToasts } from "react-toast-notifications";
import { Image } from "react-bootstrap";
import { PrimaryButton } from "components/Button";
import { getErrorMessage, captureException } from "utils/errorUtils";
import { selectIsSuperAdmin, useUserStore } from "store/user";
import { useQueryClient } from "react-query";
import ChartAndTable from "../components/ChartAndTable";
import Layout from "../components/Layout/Main";
import PopUp from "../components/Common/PopUp";
import imgStats from "../utils/logo/stats.svg";
import { getRuleStats, sendUpdateRuleRequest, getClientIdObject, getRuleDetails, disableRule } from "../utils/api";
import {
  BackgroundBox,
  Title,
  StyledContainer,
  Container,
  HorizontalContainer,
  TextNormal,
  StyledUl,
  StyledInput,
  HorizontalSpace,
} from "../components/RulesModule/styles";
import { ChartData } from "../interfaces/chartInterfaces";
import useRulePerformanceFetch from "../hooks/useRulePerformanceFetch";
import { CACHE_KEYS, RULE_ADMIN_CLIENT_ID } from "../constants";
import { MANAGE_RULE, SEARCH_PARAM_KEYS, RULE_DETAILS_PATH } from "../modulePaths";

const PARAM_KEYS = SEARCH_PARAM_KEYS[RULE_DETAILS_PATH];

interface LocationRule {
  details: RuleProps;
}

const isLocationRule = (location: unknown): location is LocationRule => "details" in (location as LocationRule);

interface StatsAttribute {
  key: string;
  value: string;
}

const RuleSection = ({ title, data, textTid }: { title: string; data: string | JSX.Element; textTid?: string }) => (
  <Container>
    <Title style={{ marginTop: 40 }}>{title}</Title>
    <HorizontalSpace />
    <TextNormal style={{ lineBreak: "anywhere" }} data-tid={textTid}>
      {data}
    </TextNormal>
  </Container>
);

const RuleDetails = (): JSX.Element => {
  const location = useLocation();
  const emptyChart = useMemo(
    () => ({
      type: "area" as const,
      tableData: [["Date", "Count"]],
      xaxisData: [],
      yaxisData: [],
      xAxisTitle: "Date",
      yAxisTitle: "Hits",
    }),
    []
  );
  const navigate = useNavigate();
  const { state: ruleData } = location;

  const [ruleDetails, setRuleDetails] = useState<RuleProps>();
  const [statDays, setStatDays] = useState(1);
  const [chartData, setChartData] = useState<ChartData>(emptyChart);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingRule, setIsUpdatingRule] = useState(false);
  const [showDeprecateRulePopup, toggleShowDeprecateRulePopup] = useToggle(false);
  const [showDisableRulePopup, toggleShowDisableRulePopup] = useToggle(false);
  const [clientId, setClientId] = useState("");
  const queryClient = useQueryClient();

  const { addToast } = useToasts();

  const [params] = useSearchParams();
  const ruleID = params.get(PARAM_KEYS.RULE_ID);
  const organisationFromUserStore = useUserStore(({ organisation }) => organisation);
  const isSuperAdmin = useUserStore(selectIsSuperAdmin);
  const paramOrg = params.get(PARAM_KEYS.ORG);
  const org = paramOrg && organisationFromUserStore ? paramOrg : organisationFromUserStore;
  const clientIdSearchParams = params.get(PARAM_KEYS.CLIENT_ID);

  const { rulePerformance } = useRulePerformanceFetch(clientId, ruleID || "");

  const loadChartData = useCallback(async () => {
    if (ruleID && clientId !== "") {
      try {
        setIsLoading(true);
        const resultData = await getRuleStats(ruleID, String(statDays), clientId, org);
        setIsLoading(false);
        const d =
          resultData.length > 0 ? resultData.filter((r: StatsAttribute) => r.value && parseInt(r.value || "0", 10) > 0) : [];
        if (d.length > 0) {
          setChartData({
            type: "area",
            tableData: [["Date", "Count"], ...d],
            xaxisData: d.map((r: StatsAttribute) => r.key),
            yaxisData: d.map((r: StatsAttribute) => parseInt(r.value, 10)),
            xAxisTitle: "Date",
            yAxisTitle: "Hits",
          });
        } else {
          setChartData(emptyChart);
        }
      } catch (e) {
        setIsLoading(false);
        setChartData(emptyChart);
        captureException(e);
      }
    }
  }, [ruleID, clientId, organisationFromUserStore, statDays, emptyChart, org]);

  useEffect(() => {
    if (error.length > 0) {
      addToast(`${error}`, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }, [error]);

  useEffect(() => {
    async function getClientIdFromOrg() {
      if (clientIdSearchParams) {
        setClientId(clientIdSearchParams.toString());
      } else if (org) {
        try {
          const data = await getClientIdObject(org);
          setClientId(data.client_id);
        } catch (e) {
          captureException(e);
          setError("Cannot get organisation id");
        }
      }
    }
    getClientIdFromOrg()
      .then()
      .catch((err) => captureException(err));
  }, [org, clientIdSearchParams]);

  useEffect(() => {
    const loadDetails = async () => {
      if (ruleID) {
        try {
          const result = await getRuleDetails(ruleID);
          const ruleInfo: RuleProps = {
            ...result,
            action: {
              tags: result.action.tags.map((tag) => ({
                key: tag.key,
                value: tag.value,
                type: tag.actionType,
              })),
            },
            organisation: org,
            description: "",
            queueID: result.queueID === undefined ? "" : result.queueID,
            depreciated: !!result.depreciated,
          };
          setRuleDetails(ruleInfo);
        } catch (e) {
          setError(getErrorMessage(e));
          captureException(e);
        }
      }
    };
    if (ruleData) {
      if (isLocationRule(ruleData) && ruleData.details && !ruleDetails) {
        setRuleDetails(ruleData.details);
      }
    } else if (ruleID && !ruleDetails) {
      loadDetails()
        .then()
        .catch((e) => {
          captureException(e);
        });
    }
  }, [ruleData, ruleDetails, ruleID, org, loadChartData]);

  useEffect(() => {
    if (clientId && clientId.length > 0) {
      loadChartData()
        .then()
        .catch((e) => {
          captureException(e);
        });
    }
  }, [loadChartData, clientId, ruleID, org]);

  const getActionsValue = () => {
    let data: string[] = [];
    if (ruleDetails && ruleDetails.action && ruleDetails.action.tags) {
      data = ruleDetails.action.tags.map((element) => `${element.key}:${element.value}`);
    }

    return data.length === 0 ? "-" : data.join(", ");
  };

  const deprecateRule = async () => {
    const msgFailed = "Failed to update rule";

    if (!ruleDetails || !ruleDetails.checkpoint) {
      setError(msgFailed);
      return;
    }
    const deprecateRuleByUpdateRule = async () => {
      const rule = ruleDetails;
      rule.depreciated = true;
      if (rule.action) {
        if (!rule.action.tags) {
          rule.action = undefined;
        }
      }
      const payload = {
        rule,
        clientID: clientId,
        checkpoint: ruleDetails.checkpoint.toLowerCase(),
      };
      setIsUpdatingRule(true);
      try {
        await sendUpdateRuleRequest(payload, organisationFromUserStore);
        // TODO: Use react-query mutation and move it to some function outside the React component. https://react-query.tanstack.com/guides/updates-from-mutation-responses
        await queryClient.invalidateQueries([CACHE_KEYS.RULES, organisationFromUserStore, ruleDetails.checkpoint]);
      } catch (reason) {
        const err = reason && typeof reason === "string" ? reason : msgFailed;
        setError(err);
        captureException(err);
        return; // By using return, complete the function immediately after the `finally` block.
      } finally {
        setIsUpdatingRule(false);
      }
      navigate(-1);
    };

    await deprecateRuleByUpdateRule().catch((e) => {
      captureException(e);
    });
  };

  const disableRuleByClient = async () => {
    if (!ruleDetails) {
      return;
    }
    try {
      setIsUpdatingRule(true);
      await disableRule({ ruleID: ruleDetails.id, clientId });
      // TODO: Use react-query mutation and move it to some function outside the React component. https://react-query.tanstack.com/guides/updates-from-mutation-responses
      await queryClient.invalidateQueries([CACHE_KEYS.RULES, organisationFromUserStore, ruleDetails.checkpoint]);
    } catch (e) {
      setError(getErrorMessage(e));
      captureException(e);
      return;
    } finally {
      setIsUpdatingRule(false);
    }
    navigate(-1);
  };

  const isWideScreen = () => window.screen.width > 800;

  const renderRulePerformanceMetrics = (performance: RulePerformanceKind | undefined) => {
    if (performance) {
      return (
        <>
          <p>
            Fraud Precision:{" "}
            {Math.round((performance.FraudCount / (performance.FraudCount + performance.ApprovedCount)) * 100) / 100}
          </p>
          <p>
            Chargeback Precision:{" "}
            {Math.round(
              ((performance.FraudCount + performance.ChargebackCount) /
                (performance.FraudCount + performance.ChargebackCount + performance.ApprovedCount)) *
                100
            ) / 100}
          </p>
          <p>
            Declined Precision:{" "}
            {Math.round((performance.DeclinedCount / (performance.DeclinedCount + performance.ApprovedCount)) * 100) / 100}
          </p>
        </>
      );
    }
    return "-";
  };

  return (
    <Layout>
      <PopUp
        show={showDeprecateRulePopup}
        title="Deprecate Rule"
        message="Are you sure you want to deprecate this rule?"
        isLoading={isUpdatingRule}
        handleClose={() => {
          toggleShowDeprecateRulePopup();
        }}
        handleSubmit={deprecateRule}
      />
      <PopUp
        show={showDisableRulePopup}
        title="Disable Rule"
        message="Are you sure you want to disable this rule?"
        isLoading={isUpdatingRule}
        handleClose={() => {
          toggleShowDisableRulePopup();
        }}
        handleSubmit={disableRuleByClient}
      />
      <Container style={{ margin: "auto" }}>
        {ruleDetails ? (
          <BackgroundBox style={{ boxShadow: "none" }}>
            <HorizontalContainer
              style={{
                alignItems: "center",
                marginTop: 20,
                justifyContent: "space-between",
              }}
            >
              <Title style={{ marginLeft: 20 }} data-tid="title_rule_details">
                RULE: {ruleDetails.name.toUpperCase()}
              </Title>
              {ruleDetails.isEditable || clientId === RULE_ADMIN_CLIENT_ID ? (
                <HorizontalContainer>
                  <PrimaryButton
                    style={{ marginRight: 20 }}
                    onClick={() => {
                      navigate(
                        { pathname: MANAGE_RULE },
                        {
                          state: { ruleDetails },
                        }
                      );
                    }}
                    data-tid="rule_details_edit_button"
                  >
                    Edit
                  </PrimaryButton>
                  <PrimaryButton
                    style={{ marginRight: 20 }}
                    onClick={() => {
                      toggleShowDeprecateRulePopup();
                    }}
                    data-tid="rule_details_deprecate_button"
                  >
                    Deprecate
                  </PrimaryButton>
                </HorizontalContainer>
              ) : (
                <HorizontalContainer>
                  <PrimaryButton
                    style={{ marginRight: 20 }}
                    onClick={() => {
                      toggleShowDisableRulePopup();
                    }}
                    data-tid="rule_details_disable_button"
                  >
                    Disable
                  </PrimaryButton>
                </HorizontalContainer>
              )}
            </HorizontalContainer>

            {!ruleDetails.isEditable && isSuperAdmin && (
              <StyledUl style={{ justifyContent: "end", padding: "10px 20px", color: "var(--danger)" }}>
                <span style={{ fontSize: 12, fontWeight: 500 }} data-tid="note_rule_details">
                  *if you want to edit this rule open this rule with demo.sardine.ai
                </span>
              </StyledUl>
            )}

            <HorizontalContainer>
              <StyledContainer style={{ minWidth: "50%", maxWidth: "90%" }}>
                <HorizontalContainer>
                  <HorizontalContainer style={{ width: "50%" }}>
                    <Title>Active:</Title>
                    <TextNormal>{ruleDetails.depreciated ? "NO" : "YES"}</TextNormal>
                  </HorizontalContainer>

                  <HorizontalContainer style={{ width: "50%", justifyContent: "flex-end" }}>
                    <Title>ENV:</Title>
                    <TextNormal>{ruleDetails.isShadow ? RULE_ENV_MODES.Shadow : RULE_ENV_MODES.Live}</TextNormal>
                  </HorizontalContainer>
                </HorizontalContainer>

                <RuleSection title="Rule Condition:" data={ruleDetails.condition} textTid="rule_details_rule_condition_text" />
                {ruleDetails.reasonCodesExpr ? (
                  <RuleSection
                    title="Reason Code:"
                    data={ruleDetails.reasonCodesExpr.length > 0 ? ruleDetails.reasonCodesExpr : "-"}
                  />
                ) : null}
                <RuleSection title="Description:" data={ruleDetails.description} />
                <RuleSection title="Action Tags:" data={getActionsValue()} />
                <RuleSection title="Rule Performance:" data={renderRulePerformanceMetrics(rulePerformance)} />

                <HorizontalContainer
                  style={{
                    marginTop: 40,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Title>RULE STATS:</Title>
                  <Container>
                    <TextNormal style={{ fontSize: 12 }}>x - How many times condition evaluated</TextNormal>
                    <TextNormal style={{ fontSize: 12 }}>y - Usage count</TextNormal>
                  </Container>
                </HorizontalContainer>

                <HorizontalSpace style={{ marginTop: 50 }} />

                {isLoading ? (
                  <Title style={{ margin: 20, fontSize: 17, textAlign: "center" }}>Loading Stats...⏳</Title>
                ) : chartData.yaxisData.reduce((a, b) => a + b, 0) === 0 ? (
                  <div style={{ alignItems: "center", margin: 20 }}>
                    <Image src={imgStats} style={{ width: "100%", height: 100, marginBottom: 10 }} />
                    <Title style={{ margin: 20, fontSize: 17, textAlign: "center", color: "grey" }}>No Stats Available!!</Title>
                  </div>
                ) : (
                  <Container>
                    <StyledUl style={{ justifyContent: "flex-end" }}>
                      <TextNormal style={{ fontSize: 15 }}> Day(s): </TextNormal>
                      <HorizontalSpace />
                      <StyledInput
                        type="number"
                        style={{ width: 80 }}
                        value={statDays}
                        onChange={(event) => {
                          setStatDays(parseInt(event.target.value, 10));
                        }}
                        onKeyPress={(event) => {
                          if (event.key === "Enter" && statDays > 0) {
                            loadChartData()
                              .then()
                              .catch((e) => {
                                captureException(e);
                              });
                          }
                        }}
                      />
                    </StyledUl>

                    <ChartAndTable
                      id="stats"
                      chartType={isWideScreen() ? "large" : "small"}
                      showChart
                      showTable
                      data={chartData}
                      title="Usage"
                    />
                  </Container>
                )}
                <HorizontalSpace style={{ marginTop: 50 }} />
              </StyledContainer>
            </HorizontalContainer>
          </BackgroundBox>
        ) : null}
      </Container>
    </Layout>
  );
};
export default RuleDetails;
