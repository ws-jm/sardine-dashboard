import React from "react";
import { Card } from "react-bootstrap";
import { Transaction } from "sardine-dashboard-typescript-definitions";
import ReactApexChart from "react-apexcharts";
import moment from "moment";
import { DATE_FORMATS } from "../../../constants";
import { DetailsCardView } from "../styles";

interface Props {
  data: Transaction[];
}

const PaymentMethodChart = (props: Props) => {
  const { data } = props;
  if (data.length === 0) {
    return null;
  }

  const chartData = {
    credit: data.filter((d) => ["sell", "deposit", "refund"].includes(d.action_type)).map((d) => d.amount.toFixed(2)),
    debit: data.filter((d) => ["buy", "withdraw", "payment", "topup"].includes(d.action_type)).map((d) => d.amount.toFixed(2)),
  };

  const categories = data.map((d) =>
    moment(d.created_milli > 0 ? d.created_milli / 1000 : 0)
      .utc()
      .format(DATE_FORMATS.DATETIME)
  );
  return (
    <DetailsCardView>
      <Card.Body id="pm_transactions_chart">
        <ReactApexChart
          type="area"
          options={{
            chart: {
              type: "area",
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              curve: "smooth",
            },
            xaxis: {
              type: "datetime",
              categories,
            },
            tooltip: {
              x: {
                formatter: (val) => `Date: ${val > 0 ? moment(val).utc().format(DATE_FORMATS.DATETIME) : "N/A"}`,
              },
              y: {
                formatter: (val) => `$${val}`,
              },
            },
          }}
          series={[
            {
              name: "Credit",
              data: chartData.credit,
            },
            {
              name: "Debit",
              data: chartData.debit,
            },
          ]}
          height={270}
          width="100%"
        />
      </Card.Body>
    </DetailsCardView>
  );
};

export default PaymentMethodChart;
