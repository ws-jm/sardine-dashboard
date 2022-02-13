import styled from "styled-components";

export const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: auto;
  width: -webkit-fill-available;
  display: table;
`;

export const Cell = styled.td<{ bold?: boolean }>`
  vertical-align: middle;
  min-height: 25px;
  padding: 10px 10px;
`;

export const StyledTh = styled.th`
  height: 16px;
  padding: 0px 8px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  /* identical to box height */

  letter-spacing: 0.14em;
  text-transform: uppercase;

  /* Secondary */

  color: black;
`;

export const StyledTr = styled.tr`
  height: 36px;

  border-radius: 4px;
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 140%;
  font-feature-settings: "ss02" on, "zero" on;
  padding: 9px 0px;
  background-color: #ffffff;
  :nth-child(even) {
    background-color: #f7f9fc;
  }

  color: #000000;
`;
