import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Spinner } from "react-bootstrap";
import styled from "styled-components";
import { captureException } from "utils/errorUtils";
import { getRuleFeatureStats } from "../../utils/api";
import { DATA_TYPES, FunctionChild, supportedFunctions } from "../../utils/dataProviderUtils";

const Container = styled.div`
  margin: 10px 50px;
`;

const SpinnerContainer = styled.div`
  width: 100%;
  height: 120px;
  padding-top: 50px;
  padding-left: 45%;
`;

const getOptionsData = (categories: string[]) => ({
  chart: {
    type: "bar" as const,
    height: 350,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      dataLabels: {
        position: "top",
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter(val: string) {
      return `${val}%`;
    },
    offsetY: -25,
    style: {
      fontSize: "12px",
      colors: ["#304758"],
    },
  },
  xaxis: {
    categories,
  },
  tooltip: {
    enabled: false,
  },
});

interface IRule {
  rule: string;
  datatype: string;
}

interface IProps {
  rule: IRule;
  organisation: string;
  description: string;
}

const Trend: React.FC<{ rule: IRule; data: string[][] | undefined }> = (props) => {
  const { rule, data } = props;
  const label = rule.datatype === "string" ? "Your recent data trend (up to 10 most frequent values)" : "Your recent data trend";
  const labels = data?.map((d) => d[0]);
  const mapedData = data?.map((d) => d[1]);
  if (mapedData?.length === 0 || mapedData?.every((e) => e === "0")) {
    return null;
  }
  return (
    <>
      <span>{label}:</span>
      {mapedData ? (
        <Chart options={getOptionsData(labels || [])} series={[{ data: mapedData }]} type="bar" width="100%" height="100%" />
      ) : (
        <SpinnerContainer>
          <Spinner animation="border" role="status" variant="primary" />
        </SpinnerContainer>
      )}
    </>
  );
};

export const DescriptionAndStats = (props: IProps) => {
  const { rule, organisation, description } = props;
  const [data, setData] = useState(undefined);
  const [loadError, setLoadError] = useState(undefined);

  const functionFilter = supportedFunctions.filter((func: FunctionChild) => rule.rule.includes(func.value));

  useEffect(() => {
    async function loadStats() {
      setData(undefined);
      setLoadError(undefined);
      if (functionFilter.length > 0) {
        return;
      }
      const val = await getRuleFeatureStats(
        {
          feature: rule.rule,
          datatype: rule.datatype,
        },
        organisation
      );
      setData(val.result);
      setLoadError(val.error);
    }
    if (rule.datatype !== DATA_TYPES.function) {
      loadStats().catch(captureException);
    }
  }, [rule.rule, rule.datatype, organisation]);

  return (
    <Container>
      <div>
        <span>
          <b>{rule.rule}: </b>
        </span>
        <span>{description}</span>
      </div>
      <div>
        <span>
          <b>Type: </b>
        </span>
        <span>{rule.datatype}</span>
      </div>
      <br />
      {loadError && <div>Error loading data trends</div>}
      {data && <Trend rule={rule} data={data} />}
    </Container>
  );
};
