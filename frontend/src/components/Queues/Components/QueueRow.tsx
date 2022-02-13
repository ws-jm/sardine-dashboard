import React from "react";
import styled from "styled-components";
import { StyledTitleName } from "components/Dashboard/styles";
import { StyledTr, TdValue } from "../styles";
import { QueuePropsItem } from "./Queue";

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

export const QueueRow = (p: QueuePropsItem) => (
  <StyledTr>
    <Cell>
      <TdValue
        style={{
          fontSize: 15,
          color: "#2173FF",
          textDecorationLine: "underline",
        }}
        onClick={p.onClick}
      >
        {p.queueData?.name}
      </TdValue>
    </Cell>
    <Cell>{p.queueData?.owner.name || "-"}</Cell>
    <Cell>{p.queueData?.hits || "-"}</Cell>
  </StyledTr>
);
