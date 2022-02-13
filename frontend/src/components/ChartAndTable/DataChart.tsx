import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Chart from "react-apexcharts";
import moment from "moment";
import { ApexOptions } from "apexcharts";
import { ChartData, ChartType } from "../../interfaces/chartInterfaces";

const StyledDiv = styled.div<{ chartType: ChartType; showTable: boolean }>`
  height: ${(props) => (props.chartType === "small" ? "146px" : "401px")};
  width: 100%;
  padding: ${(props) => (props.chartType === "small" ? "0px 10px 0px 0px" : "16px")};
  border-bottom: ${(props) => (props.showTable ? "1px solid #EAEDF2" : "")};
  @media (max-width: 700px) {
    padding: 0px 10px 0px 0px;
    height: 146px;
  }
  .apexcharts-xaxistooltip.apexcharts-active {
    width: 75px;
    height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${(props) => (props.chartType === "small" ? "3px" : "7px")};
    z-index: 2000;
    background: #ffffff;
    color: #2173ff;
    /* Brand (secondary) */

    border: 1px solid #2173ff;
    box-sizing: border-box;
    border-radius: 23px;
    @media (max-width: 700px) {
      margin-top: 3px;
    }
  }
  .apexcharts-xaxistooltip:after,
  .apexcharts-xaxistooltip:before {
    display: none;
  }
  .apexcharts-tooltip {
    top: 0;
    background: #ffffff;
    color: #2173ff;
    box-shadow: none;
    border-radius: 23px;
  }
  .eNRov .apexcharts-tooltip {
    top: 0;
  }
  .apexcharts-tooltip apexcharts-theme-light apexcharts-active {
    top: 0;
  }
  .apexcharts-tooltip.apexcharts-theme-light {
    border: none;
  }
  .cWdVXZ .apexcharts-tooltip.apexcharts-theme-light {
    top: 0;
  }
  .apexcharts-menu-icon {
    display: none;
  }
`;

const getMinTickAmount = (arr: number[]) => {
  let diff = Infinity;
  for (let i = 1; i < arr.length; i++) {
    const newDiff = Math.abs(arr[i] - arr[i - 1]);
    diff = Math.min(diff, newDiff);
  }
  return diff;
};

const DataChart = (props: { data: ChartData; chartType: ChartType; id: string; showTable: boolean }): JSX.Element => {
  const { data, chartType, id, showTable } = props;
  const [mq, setMq] = useState("desktop");
  useEffect(() => {
    setMq(window.innerWidth > 700 ? "desktop" : "mobile");
  }, []);

  let tickAmount = getMinTickAmount(data.yaxisData);
  tickAmount = Math.min(tickAmount, mq === "desktop" ? (chartType === "small" ? 3 : 5) : 3);

  const getOptionsData: () => ApexOptions = () => {
    const options = {
      chart: {
        id,
        type: "area" as const,
        fontFamily: "IBM Plex Sans",
        fontSize: "16px",
        redrawOnParentResize: true,
        toolbar: {
          show: true,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
            customIcons: [],
          },
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        type: "category" as const,
        tickAmount: 5,
        categories: data && data.xaxisData.length ? data.xaxisData : [], // e.g. ["01 Jan", "02 Jan", "03 Jan"]
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          formatter(value: string) {
            return id === "stats"
              ? moment(value, "YYYY-MM-DD hh:mm").format("MMM-DD hh:mm")
              : data.type === "bar"
              ? value && value.substr(0, 25)
              : value && moment(value, "YYYY-MM-DD").format("DD");
          },
        },
        crosshairs: {
          show: true,
          width: 1,
          position: "back" as const,
          opacity: 0.9,
          stroke: {
            color: "#EAEDF2",
            width: 1,
            dashArray: 0,
          },
        },
      },
      yaxis: {
        tickAmount,
        labels: {
          formatter: (value: number) => {
            if (value < 1000) return value.toFixed(0);
            return `${value / 1000}k`;
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#EAEDF2",
        width: 1,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: mq === "desktop" ? chartType !== "small" : false,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: "gradient" as const,
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.3,
          opacityTo: 0.5,
          stops: [0, 90, 100],
        },
      },
      stroke: {
        width: 2,
        curve: "straight" as const,
        linecap: "round" as const,
      },
      tooltip: {
        shared: false,
        followCursor: true,
        custom({ series, seriesIndex, dataPointIndex }: { series: string[][]; seriesIndex: number; dataPointIndex: number }) {
          return (
            `${
              '<div  style="display: flex ;justify-content: center; align-items : center; min-width:58px; height: 22px; border: 1px solid #2173FF; box-sizing:border-box; border-radius:23px;">' +
              "<span>"
            }${series[seriesIndex][dataPointIndex]}</span>` + `</div>`
          );
        },
      },
      markers: {
        size: 0,
        strokeColors: "#2173FF",
        strokeWidth: 8,
        strokeOpacity: 0.2,
        strokeDashArray: 0,
        fillOpacity: 0.9,
        shape: "circle" as const,
      },
    };

    return options;
  };

  const getSeriesData = () => {
    const series = [
      {
        name: "Series 1",
        data: data && data.yaxisData.length ? data.yaxisData : [], // e.g. ["Value 1", "value 2", "value 3"]
      },
    ];
    return series;
  };

  return (
    <StyledDiv chartType={chartType} showTable={showTable}>
      <Chart options={getOptionsData()} series={getSeriesData()} type={data.type} width="100%" height="100%" />
    </StyledDiv>
  );
};

export default DataChart;
