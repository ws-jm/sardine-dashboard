import DataCard, { CardAttribute } from "../DataCard";

const HEADER = "Payment Method";

interface PaymentMethodProps {
  paymentMethod: string;
  mcc: string;
  cardHash: string;
  first6: string;
  last4: string;
  routingNumber: string;
  accountNumber: string;
  recipientPaymentMethod: string;
  cryptoAddress: string;
  addressRiskLevel: string;
  cryptoCurrencyCode: string;
  cryptoCategories: string;
  recipientCryptoAddress: string;
  recipientAddressRiskLevel: string;
  recipientCryptoCurrencyCode: string;
  recipientCryptoCategories: string;
}

const PaymentMethod = (props: PaymentMethodProps): JSX.Element => {
  const {
    accountNumber,
    addressRiskLevel,
    cardHash,
    cryptoAddress,
    cryptoCurrencyCode,
    first6,
    last4,
    mcc,
    paymentMethod,
    recipientPaymentMethod,
    routingNumber,
    cryptoCategories,
    recipientAddressRiskLevel,
    recipientCryptoAddress,
    recipientCryptoCategories,
    recipientCryptoCurrencyCode,
  } = props;

  const attributes: CardAttribute[] = [];

  if (paymentMethod) {
    attributes.push({
      key: "Payment Method",
      value: paymentMethod,
      toolTip: "Payment method",
    });
  }

  if (mcc) {
    attributes.push({
      key: "MCC",
      value: mcc,
      toolTip: "MCC (merchant category code) for this transaction",
    });
  }

  if (cardHash) {
    attributes.push({
      key: "Card Hash",
      value: cardHash,
      toolTip: "Sha-256 hash of card number(PAN)",
    });
  }

  if (first6) {
    attributes.push({
      key: "First 6",
      value: first6,
      toolTip: "First 6 digit of card number",
    });
  }

  if (last4) {
    attributes.push({
      key: "Last 4",
      value: last4,
      toolTip: "Last 4 digit of card number",
    });
  }

  if (routingNumber) {
    attributes.push({
      key: "Routing Number",
      value: routingNumber,
      toolTip: "Bank routing number",
    });
  }

  if (accountNumber) {
    attributes.push({
      key: "Account Number",
      value: accountNumber,
      toolTip: "Bank account number",
    });
  }

  if (cryptoAddress) {
    attributes.push({
      key: "Crypto Address",
      value: cryptoAddress,
      toolTip: "Crypto address",
    });
  }

  if (addressRiskLevel) {
    attributes.push({
      key: "Address Risk Level",
      value: addressRiskLevel,
      toolTip: "Address risk level",
    });
  }

  if (cryptoCurrencyCode) {
    attributes.push({
      key: "Crypto Currency Code",
      value: cryptoCurrencyCode,
      toolTip: "Currency code or symbol such as BTC or ETH",
    });
  }

  if (cryptoCategories) {
    attributes.push({
      key: "Crypto Categories",
      value: cryptoCategories,
      toolTip: "Categories of crypto",
    });
  }

  if (recipientCryptoAddress) {
    attributes.push({
      key: "Recipient Crypto Address",
      value: recipientCryptoAddress,
      toolTip: "Recipient Crypto address",
    });
  }

  if (recipientAddressRiskLevel) {
    attributes.push({
      key: "Recipient Address Risk Level",
      value: recipientAddressRiskLevel,
      toolTip: "Recipient Address risk level",
    });
  }

  if (recipientCryptoCurrencyCode) {
    attributes.push({
      key: "Recipient Crypto Currency Code",
      value: recipientCryptoCurrencyCode,
      toolTip: "Recipient Currency code or symbol such as BTC or ETH",
    });
  }

  if (recipientCryptoCategories) {
    attributes.push({
      key: "Recipient Crypto Categories",
      value: recipientCryptoCategories,
      toolTip: "Recipient Categories of crypto",
    });
  }

  if (recipientPaymentMethod) {
    attributes.push({
      key: "Recipient Payment Method",
      value: recipientPaymentMethod,
      toolTip: "Recipient payment method",
    });
  }

  return attributes.length > 0 ? <DataCard header={HEADER} attributes={attributes} /> : <div />;
};

export default PaymentMethod;
