import { DATE_FORMATS, TIME_UNITS } from "../../constants";
import { formatTimestampInUtc } from "../../utils/timeUtils";
import DataCard, { CardAttribute } from "./DataCard";

const HEADER = "Transaction";

interface TransactionProps {
  amount: number;
  paymentType: string;
  currenyCode: string;
  itemCategory: string;
  createdAtMillis: number;
  actionType: string;
}

const Transaction = (props: TransactionProps): JSX.Element => {
  const { actionType, amount, createdAtMillis, currenyCode, itemCategory, paymentType } = props;

  const attributes: CardAttribute[] = [
    {
      key: "Amount",
      value: `${currenyCode} ${amount}`,
      toolTip: "Amount of transaction",
    },
    {
      key: "Type",
      value: paymentType,
      toolTip: "Transaction type",
    },
    {
      key: "Item Category",
      value: itemCategory,
      toolTip: "Main item category in cart. e.g. crypto asset(ETH, BTC), gift card, alcohol, generic",
    },
    {
      key: "Created At",
      value: formatTimestampInUtc(createdAtMillis, { format: DATE_FORMATS.LLL, unit: TIME_UNITS.MILLISECOND }),
      toolTip: "Created date",
    },
    {
      key: "Action Type",
      value: actionType,
      toolTip:
        "Indicates the type of transaction: buy, sell, deposit, withdraw, refund, payment, and topup. If you need other action type to be supported, please reach out sardine team.",
    },
  ];
  return <DataCard header={HEADER} attributes={attributes} />;
};

export default Transaction;
