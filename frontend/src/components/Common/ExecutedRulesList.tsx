import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Rule } from "sardine-dashboard-typescript-definitions";
import { captureException } from "utils/errorUtils";
import { orderRulesByRiskLevel } from "utils/orderRulesByRiskLevel";
import { getExecutedRules } from "../../utils/api";
import { StyledRulesWrapper } from "../Customers/styles";

const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: auto;
  width: -webkit-fill-available;
  display: table;
`;

const StyledTh = styled.th`
  padding: 10px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-size: 14px;
  font-weight: normal;
  color: #aba69a;
  background: white;
`;

const StyledTr = styled.tr`
  height: 36px;

  border-radius: 4px;
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  font-feature-settings: "ss02" on, "zero" on;
  color: #141A39;
  padding: 9px 0px;
  background-color: #ffffff;
  border: solid 1px transparent;
  border-bottom-color: #F2F6FF;
  width: auto;
  :hover {
    background-color: #F7F9FC;
`;

const Cell = styled.td`
  vertical-align: middle;
  min-height: 25px;
  padding: 15px 10px;
  letter-spacing: 0em;
  text-align: left;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  color: #141a39;
`;
const TdValue = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 14px;
  color: #141a39;
`;

const RuleName = styled(TdValue)`
  font-size: 15px;
  color: #141a39;
  text-decoration: none;
`;

interface IProps {
  sessionKey: string;
  date: string;
  clientRules?: Array<Rule>;
  executedRules?: Array<number>;
  clientID: string;
  onClick: (id: string) => void;
}

const ExecutedRulesList: React.FC<IProps> = (props) => {
  const { clientID, date, sessionKey, clientRules, executedRules, onClick } = props;

  const [rulesData, setRulesData] = useState<Array<Rule>>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = ["Rule Id", "Rule Name", "Action", "Checkpoint"];

  useEffect(() => {
    async function loadRules() {
      setIsLoading(true);
      try {
        let rules: Array<Rule> = [];
        if (executedRules !== undefined && clientRules !== undefined && clientRules.length !== 0 && executedRules.length !== 0) {
          rules = clientRules.filter((r: Rule) => executedRules?.includes(r.id));
        } else {
          const splitDate = date.split(" ")[0];
          rules = await getExecutedRules(splitDate, sessionKey, clientID);
        }
        setRulesData(rules);
      } catch (e) {
        setError("Failed to load rules");
      }

      setIsLoading(false);
    }

    if (!isDataLoaded && date && sessionKey && clientID) {
      setIsDataLoaded(true);
      loadRules()
        .then()
        .catch((e) => captureException(e));
    }
  }, [isDataLoaded, date, sessionKey, clientID, clientRules, executedRules]);

  return isLoading ? (
    <TdValue>Loading...</TdValue>
  ) : error.length > 0 ? (
    <TdValue style={{ color: "grey" }}>{error}</TdValue>
  ) : rulesData.length === 0 ? (
    <TdValue style={{ color: "grey" }}>No data available!</TdValue>
  ) : (
    <StyledRulesWrapper id="executed_rules">
      <StyledTable>
        <thead style={{ height: 50 }}>
          <StyledTr>
            {headers.map((ele) => (
              <StyledTh key={ele}>{ele}</StyledTh>
            ))}
          </StyledTr>
        </thead>
        <tbody>
          {orderRulesByRiskLevel(rulesData).map((d) => (
            <StyledTr key={d.id}>
              <Cell>
                <RuleName style={{ paddingLeft: 20 }} onClick={() => onClick(String(d.id))}>
                  {d.id || "-"}
                </RuleName>
              </Cell>
              <Cell>
                <RuleName onClick={() => onClick(String(d.id))}>{d.name || "-"}</RuleName>
              </Cell>
              <Cell style={{ lineBreak: "auto" }}>
                {d.action?.tags
                  ? d.action.tags!.length > 0
                    ? d.action.tags.map((a) => `${a.key}: ${a.value}`).join(", ")
                    : "-"
                  : "-"}
              </Cell>
              <Cell>{d.checkpoint || "-"}</Cell>
            </StyledTr>
          ))}
        </tbody>
      </StyledTable>
    </StyledRulesWrapper>
  );
};

export default ExecutedRulesList;
