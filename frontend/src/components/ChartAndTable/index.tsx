import React from "react";
import styled from "styled-components";
import moment from "moment";
import DataChart from "./DataChart";
import DataTable from "./DataTable";
import { ChartType, ChartData } from "../../interfaces/chartInterfaces";
import downloadLogo from "../../utils/logo/download.svg";

const StyledChartAndTable = styled.div<{ chartType: ChartType }>`
  width: ${(props) => (props.chartType === "small" ? "330px" : props.chartType === "medium" ? "550px" : "1024px")};
  min-height: ${(props) => (props.chartType === "small" ? "190px" : "300px")};
  height: ${(props) => (props.chartType === "small" ? "190px" : "")};
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  box-shadow: 0px 14px 24px rgba(0, 0, 0, 0.05);
  transition: top 0.5s ease;

  @media only screen and (max-width: 1300px) and (min-width: 700px) {
    width: ${(props) => (props.chartType === "small" ? "330px" : "calc(100vw - 260px)")};
  }

  @media only screen and (max-width: 700px) {
    margin: ${(props) => (props.chartType === "small" ? "0px 16px" : "16px")};
    width: calc(100vw - 32px);
    min-height: 190px;
  }
`;

const StyledChartHead = styled.div<{ chartType: ChartType }>`
  height: ${(props) => (props.chartType === "small" ? "44px" : "68px")};
  display: flex;
  padding: 0px 16px;
  justify-content: space-between;
  border-bottom: 1px solid #eaedf2;
  align-items: center;
  @media (max-width: 700px) {
    height: 44px;
  }
`;

const StyledChartTitle = styled.div`
  height: 20px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */

  font-feature-settings: "ss02" on;

  /* Primary */

  color: var(--dark-14);
`;

const StyledActions = styled.div`
  display: flex;
`;

const StyledOptions = styled.div<{ chartType: ChartType; download: boolean }>`
  display: flex;
  align-items: center;
  height: 36px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */

  font-feature-settings: "ss02" on;

  /* Secondary */
  padding: ${(props) => (props.chartType === "small" ? "0px" : "0px 10px 0px 0px")};
  color: #909bad;
  cursor: pointer;
  border-radius: 4px;
  :hover {
    background: #f0f3f9;
    color: var(--dark-14);
  }
  @media (max-width: 700px) {
    padding: 0px;
    display: ${(props) => (props.download ? "none" : "flex")};
  }
`;

const StyledOptionsTitle = styled.span<{ chartType: ChartType }>`
  display: ${(props) => (props.chartType === "small" ? "none" : "")};
  @media only screen and (max-width: 700px) {
    display: none;
  }
`;

const StyledImg = styled.img`
  margin: 0px 5px;
  vertical-align: sub;
`;

const ChartAndTable = (props: {
  id: string;
  data: ChartData;
  chartType: ChartType;
  showChart: boolean;
  showTable: boolean;
  title: string;
}): JSX.Element => {
  const { chartType, showChart, showTable, id, title, data } = props;

  return (
    <StyledChartAndTable chartType={chartType} id={`${id}-${moment().format("LLL")}`}>
      <StyledChartHead chartType={chartType}>
        <StyledChartTitle>{title}</StyledChartTitle>
        <StyledActions>
          <StyledOptions chartType={chartType} download>
            <StyledImg alt="" src={downloadLogo} />
            <StyledOptionsTitle chartType={chartType}>Download</StyledOptionsTitle>
          </StyledOptions>
        </StyledActions>
      </StyledChartHead>
      {showChart && <DataChart data={data} chartType={chartType} id={id} showTable={showTable} />}
      {showTable && <DataTable data={data} />}
    </StyledChartAndTable>
  );
};

export default ChartAndTable;
