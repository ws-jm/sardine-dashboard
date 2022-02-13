import React from "react";
import styled from "styled-components";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { ChartData } from "../../interfaces/chartInterfaces";

const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: auto;
  width: -webkit-fill-available;
`;

const StyledTh = styled.th`
  height: 16px;
  padding: 0px 8px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  /* identical to box height */

  letter-spacing: 0.14em;
  text-transform: uppercase;

  /* Secondary */

  color: #909bad;
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
  color: #909bad;
  padding: 9px 0px;
  background-color: #ffffff;
  :nth-child(even) {
    background-color: #f7f9fc;
  }
  :hover {
    color: #ffffff;
    background-color: #325078;
  }
`;

const StyledTd = styled.td`
  vertical-align: middle;
  height: 20px;
  padding: 0px 8px;
`;

const DataTable = (props: { data: ChartData }): JSX.Element => {
  const { data } = props;
  return (
    <div style={{ padding: "16px", maxHeight: 400, overflowY: "scroll" }}>
      <StyledTable>
        <thead>
          <tr style={{ height: "36px" }}>
            {data.tableData[0].map((ele: AnyTodo, eleIndex: number) => (
              <StyledTh style={eleIndex !== 0 ? { textAlign: "right" } : { textAlign: "left" }} key={ele}>
                {ele}
              </StyledTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.tableData.length &&
            data.tableData.slice(1, data.tableData.length).map((ele) => (
              <StyledTr key={ele[0]}>
                {Object.values(ele).map((subEle, ind) => (
                  <StyledTd style={ind !== 0 ? { textAlign: "right" } : {}} key={subEle}>
                    {subEle}
                  </StyledTd>
                ))}
              </StyledTr>
            ))}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default DataTable;
