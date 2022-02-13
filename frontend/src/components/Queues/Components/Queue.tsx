import styled from "styled-components";
import moment from "moment";
import { CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { Button, Spinner } from "react-bootstrap";
import { StyledTitleName } from "../../Dashboard/styles";
import { StyledTr, TdValue, CheckBox } from "../styles";
import Badge from "../../Common/Badge";
import { QueueProps } from "../queueInterfaces";

export const Cell = styled.td`
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

export const Title = styled(StyledTitleName)`
  font-size: 14px;
  padding: 5px 0;
`;

export interface QueuePropsItem {
  queueData?: QueueProps;
  sessionData?: CustomersResponse;
  isSelection?: boolean;
  isCheckActive?: boolean;
  isSuperAdmin?: boolean;
  isExporting?: boolean;
  onClick: () => void;
  onChecked?: () => void;
  onRemove?: () => void;
  onExport?: () => void;
}

export const Queue = (p: QueuePropsItem): JSX.Element => {
  const {
    sessionData,
    isCheckActive,
    isSuperAdmin,
    isExporting,
    isSelection,
    queueData,
    onChecked,
    onClick,
    onRemove,
    onExport,
  } = p;
  return sessionData ? (
    <StyledTr>
      <Cell>
        <CheckBox
          onClick={onChecked}
          disabled={!(isCheckActive || false)}
          style={{
            backgroundColor: isSelection ? "#2173FF" : "#B9C5E0",
            color: isSelection ? "#FFFFFF" : "transparent",
            opacity: isCheckActive ? 1.0 : 0.3,
          }}
        >
          ✓
        </CheckBox>
      </Cell>
      <Cell>
        <TdValue
          style={{
            fontSize: 15,
            color: "#2173FF",
            textDecorationLine: "underline",
          }}
          onClick={onClick}
        >
          {sessionData?.session_key || "-"}
        </TdValue>
      </Cell>
      <Cell>{sessionData?.customer_id || "-"}</Cell>
      <Cell>{sessionData?.timestamp ? moment(parseInt(sessionData?.timestamp || "0", 10) * 1000).format("LLL") : "-"}</Cell>
      <Cell>{sessionData?.owner?.name || "-"}</Cell>
      <Cell>
        <Badge title={sessionData?.status || "-"} style={{ textTransform: "capitalize" }} />
      </Cell>
    </StyledTr>
  ) : (
    <StyledTr key={queueData?.id}>
      <Cell>
        <TdValue
          style={{
            fontSize: 15,
            color: "#2173FF",
            textDecorationLine: "underline",
          }}
          onClick={onClick}
        >
          {queueData?.name}
        </TdValue>
      </Cell>
      <Cell>{queueData?.owner.name || "-"}</Cell>
      <Cell>{queueData?.hits || "-"}</Cell>
      {onRemove && (
        <Cell>
          <Button onClick={onRemove} variant="outline-danger">
            Remove
          </Button>
          {isSuperAdmin && onExport && (
            <Button onClick={onExport} disabled={isExporting} style={{ marginLeft: 10 }} variant="outline-primary">
              {isExporting ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                <span>Export</span>
              )}
            </Button>
          )}
        </Cell>
      )}
    </StyledTr>
  );
};
