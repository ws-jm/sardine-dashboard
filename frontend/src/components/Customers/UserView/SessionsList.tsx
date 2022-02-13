import React from "react";
import Badge from "components/Common/Badge";
import moment from "moment";
import { SessionKind } from "sardine-dashboard-typescript-definitions";
import styled from "styled-components";
import { StyledTable, StyledTh } from "../styles";

const TableHeader = styled(StyledTh)`
  color: #325078;
  background: #f7f9fc;
`;

const TableRow = styled.tr`
  height: 36px;

  border-radius: 4px;
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  font-feature-settings: "ss02" on, "zero" on;
  color: grey;
  padding: 9px 0px;
  background-color: #ffffff;
  border: solid 2px transparent;
  border-bottom-color: #F7F9FC;
  width: auto;
  :hover {
    background-color: #F7F9FC;
`;

const TdValue = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 14px;
  color: #001932;
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
  color: #325078;
`;

const RuleName = styled(TdValue)`
  font-size: 15px;
  color: #325078;
  max-width: 300px;
  text-decoration-line: underline;
`;

interface IProps {
  sessions: Array<SessionKind>;
  isLoading: boolean;
  onClick: (id: string) => void;
}

const SessionsList: React.FC<IProps> = (props) => {
  const { sessions, isLoading, onClick } = props;

  const headers = ["Session Key", "Flow", "Risk Level", "Date Time"];

  return isLoading ? (
    <TdValue>Loading...</TdValue>
  ) : sessions.length === 0 ? (
    <TdValue style={{ color: "grey" }}>No data available!</TdValue>
  ) : (
    <div
      id="executed_rules"
      style={{
        maxHeight: 400,
        overflowY: "scroll",
      }}
    >
      <StyledTable>
        <thead style={{ height: 50 }}>
          <tr>
            {headers.map((ele) => (
              <TableHeader key={ele}>{ele.toUpperCase()}</TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((d) => (
            <TableRow key={d.session_key}>
              <Cell>
                <RuleName
                  onClick={() => {
                    const searchQuery = `client_id=${d.client_id}&sessionKey=${encodeURIComponent(
                      d.session_key
                    )}&customerId=${encodeURIComponent(d.customer_id)}`;
                    onClick(searchQuery);
                  }}
                >
                  {d.session_key || "-"}
                </RuleName>
              </Cell>
              <Cell>{d.flow || "-"}</Cell>
              <Cell style={{ lineBreak: "auto" }}>
                <Badge title={d.risk_level || "unknown"} />
              </Cell>
              <Cell>{moment(d.timestamp * 1000).format("LLL") || "-"}</Cell>
            </TableRow>
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default SessionsList;
