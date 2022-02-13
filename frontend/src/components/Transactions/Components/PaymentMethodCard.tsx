import React from "react";
import { Card, Container, Image } from "react-bootstrap";
import { Transaction } from "sardine-dashboard-typescript-definitions";
import paymentMethodBG from "utils/logo/payment_method_bg.svg";
import bankLogo from "utils/logo/bankLogo.svg";
import cardLogo from "utils/logo/cardLogo.svg";
import cryptoLogo from "utils/logo/cryptoLogo.svg";
import { DetailsCardView, CardContainer, TdValue } from "../styles";

interface Props {
  data: Transaction | undefined;
  transactionAmount: number;
  transactionCount: number;
}

const PaymentMethodCard: React.FC<Props> = (props) => {
  const { data, transactionAmount, transactionCount } = props;
  if (!data) {
    return null;
  }

  const MethodView = () => {
    const item = { type: "", value: "", icon: "", title: "" };
    if (data.payment_method === "card") {
      const first6 = `${data.first_6.substring(0, 4)} ${data.first_6.substr(4)}`;
      item.value = `${first6}•• •••• ${data.last_4}`;
      item.type = "Credit/Debit Card";
      item.icon = cardLogo;
      item.title = "Card Number";
    } else if (data.payment_method === "bank") {
      item.value = data.account_number;
      item.type = "ACH";
      item.icon = bankLogo;
      item.title = "Account Number";
    } else if (data.payment_method === "crypto") {
      item.value = data.crypto_address || data.recipient_payment_method_crypto?.crypto_address || "";
      item.type = "Crypto";
      item.icon = cryptoLogo;
      item.title = "Crypto Address";
    }

    return (
      <Container>
        <CardContainer>
          <Image id="pm_icon" alt="" src={item.icon} style={{ height: 22 }} />
          <TdValue id="pm_type" style={{ marginLeft: 5, fontSize: 18 }}>
            {item.type}
          </TdValue>
        </CardContainer>
        <br />
        <>
          <h6 id="pm_title">{item.title}</h6>
          <h4 id="pm_value" style={{ color: "#2173FF" }}>
            {item.value}
          </h4>
        </>
      </Container>
    );
  };

  return (
    <DetailsCardView>
      <Card.Body
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundSize: "contain",
          backgroundImage: `url(${paymentMethodBG})`,
        }}
      >
        <MethodView />
        <Container style={{ width: "max-content", margin: 10 }}>
          <TdValue id="total_amount_title" style={{ width: "max-content" }}>
            Transactions Amount
          </TdValue>
          <h4 id="total_amount_value">{`$${transactionAmount.toFixed(2)}`}</h4>
          <br />
          <TdValue id="transactions_count_title">
            Transactions {transactionCount >= 100 && <span style={{ fontSize: 9 }}>(Top 100)</span>}
          </TdValue>
          <h4 id="transactions_count_value">{transactionCount}</h4>
        </Container>
      </Card.Body>
    </DetailsCardView>
  );
};

export default PaymentMethodCard;
