import { useState } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceArea, ResponsiveContainer, Legend } from "recharts";
import { SESSION_RISK_LEVELS } from "sardine-dashboard-typescript-definitions";
import { DateRiskExpression } from "utils/chartUtils";
import dayjs from "dayjs";

const COLORS = ["#775DD0", "#FF4560", "#FEB019", "#01E396", "#018FFB"] as const;
const FORMAT = "YYYY-MM-DD";
const VERY_OLD_DATE = dayjs("1000-01-01", FORMAT);
const NOW_DATE = dayjs();

interface MouseEvent {
  activeCoordinates: {
    x: number;
    y: number;
  };
  activeLabel: string;
  activeTooltipIndex: number;
  activePayload: unknown[];
  chartX: number;
  chartY: number;
}

const ZoomableBarChart = ({ data, height }: { data: DateRiskExpression[]; height: number }): JSX.Element => {
  const [leftDate, setLeftDate] = useState(VERY_OLD_DATE);
  const [rightDate, setRightDate] = useState(NOW_DATE);
  const [leftDateTemp, setLeftDateTemp] = useState(VERY_OLD_DATE);
  const [rightDateTemp, setRightDateTemp] = useState(NOW_DATE);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDownLabel, setMouseDownLabel] = useState("");
  const [mouseMoveLabel, setMouseMoveLabel] = useState("");

  const zoom = () => {
    setIsMouseDown(false);
    if (!(leftDateTemp.isValid() && rightDateTemp.isValid())) {
      return;
    }

    let l = leftDateTemp;
    let r = rightDateTemp;
    if (l.isAfter(r)) {
      [l, r] = [r, l];
    }

    setLeftDate(l);
    setRightDate(r);
    setMouseDownLabel("");
    setMouseMoveLabel("");
  };

  const filterData = (rawData: DateRiskExpression[]) =>
    rawData.filter((dateRiskExpression) => {
      if (!dateRiskExpression.date) {
        return false;
      }
      const date = dayjs(dateRiskExpression.date, FORMAT);
      return date.isAfter(leftDate) && date.isBefore(rightDate);
    });

  const zoomOut = () => {
    let left: dayjs.Dayjs = VERY_OLD_DATE;
    let right: dayjs.Dayjs = NOW_DATE;
    if (data.length > 0) {
      const oldData = dayjs(data[0].date, FORMAT);
      if (oldData.isValid()) {
        left = oldData;
      }
      const newData = dayjs(data[data.length - 1].date, FORMAT);
      if (newData.isValid()) {
        right = newData;
      }
    }
    setLeftDate(left);
    setRightDate(right);
    setLeftDateTemp(left);
    setRightDateTemp(right);
    setMouseDownLabel("");
    setMouseMoveLabel("");
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsMouseDown(true);
    setMouseDownLabel(e.activeLabel);
    setLeftDateTemp(dayjs(e.activeLabel, FORMAT));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDown) {
      return;
    }
    setMouseMoveLabel(e.activeLabel);
    setRightDateTemp(dayjs(e.activeLabel, FORMAT));
  };

  const bars = Object.values(SESSION_RISK_LEVELS).map((risk, idx) => (
    <Bar key={risk} dataKey={risk} stackId="a" fill={COLORS[idx]} />
  ));

  return (
    <div className="highlight-bar-charts" style={{ userSelect: "none", width: "100%" }}>
      <button type="button" className="btn update" onClick={zoomOut}>
        Zoom Out
      </button>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          width={500}
          height={300}
          data={filterData(data)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={zoom}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis allowDataOverflow dataKey="date" />
          <YAxis allowDataOverflow />
          <Tooltip />
          <Legend />
          {bars}

          {mouseDownLabel && mouseMoveLabel ? (
            <ReferenceArea yAxisId="1" x1={mouseDownLabel} x2={mouseMoveLabel} strokeOpacity={0.3} />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ZoomableBarChart;
