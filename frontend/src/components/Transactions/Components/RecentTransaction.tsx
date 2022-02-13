/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import moment from "moment";
import { Card } from "react-bootstrap";
import { Transaction } from "sardine-dashboard-typescript-definitions";
import Badge from "../../Common/Badge";
import { DetailsCardView, StyledTable, TdValue, StyledTh, Cell, StyledTr, DetailsCardHeader } from "../styles";

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
}

const RecentTransaction: React.FC<Props> = (props) => {
  const { isLoading, transactions } = props;

  const headers = ["Date & Time", "Transaction Id", "Amount", "Type", "Risk Level", "AML Level", "Category"];

  return (
    <DetailsCardView style={{ width: "100%", height: "unset" }}>
      <DetailsCardHeader id="recent_transaction_title">
        Recent Transaction {transactions.length >= 100 && <span style={{ fontSize: 9 }}>(Top 100)</span>}
      </DetailsCardHeader>
      <Card.Body>
        {isLoading ? (
          <TdValue>Loading...</TdValue>
        ) : transactions.length === 0 ? (
          <TdValue id="no_data_message" style={{ color: "grey" }}>
            No data available!
          </TdValue>
        ) : (
          <div
            style={{
              maxHeight: 400,
              overflowY: "scroll",
            }}
          >
            <StyledTable id="recent_transaction_table">
              <thead style={{ height: 50 }}>
                <tr>
                  {headers.map((ele) => (
                    <StyledTh id={`th_${ele}`} key={`${ele}`}>
                      {ele.toUpperCase()}
                    </StyledTh>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((d, index) => {
                  const { id, amount, action_type, risk_level, aml_level, item_category, created_milli } = d;
                  return (
                    <StyledTr key={index.toString()}>
                      <Cell>{moment(created_milli).format("LLL")}</Cell>
                      <Cell>{id || "-"}</Cell>
                      <Cell>{amount.toFixed(2) || "-"}</Cell>
                      <Cell>{action_type || "-"}</Cell>
                      <Cell>
                        <Badge title={risk_level || "unknown"} />
                      </Cell>
                      <Cell>
                        <Badge title={aml_level || "unknown"} />
                      </Cell>
                      <Cell>{item_category || "-"}</Cell>
                    </StyledTr>
                  );
                })}
              </tbody>
            </StyledTable>
          </div>
        )}
      </Card.Body>
    </DetailsCardView>
  );
};

export default RecentTransaction;
