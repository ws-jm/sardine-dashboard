import { renderReasonCodes } from "utils/renderReasonCodes";
import DataCard, { CardAttribute } from "../DataCard";

const HEADER = "Phone Signals";

interface CustomerPhoneProps {
  phoneLevel: string;
  phoneReasonCodes: string;
  phoneScoreReason: string;
  nameScore: string;
  addressScore: string;
}

const CustomerPhone = (props: CustomerPhoneProps): JSX.Element => {
  const { addressScore, nameScore, phoneLevel, phoneReasonCodes, phoneScoreReason } = props;
  const attributes: CardAttribute[] = [
    {
      key: "Phone Level",
      value: phoneLevel,
      toolTip: "Phone risk level",
    },
    {
      key: "Phone Reason Codes",
      value: renderReasonCodes(phoneReasonCodes),
      toolTip: "Reason codes for phone risk level",
    },
    {
      key: "Phone Score Reason",
      value: phoneScoreReason,
      toolTip: "Phone risk level summary",
    },
    {
      key: "Name Score",
      value: nameScore,
      toolTip:
        "Match score of user's name, provided by you and name associated with phone number. Range: (0-100). 100 means exact match",
    },
    {
      key: "Address Score",
      value: addressScore,
      toolTip:
        "Match score of user's address, provided by you and address associated with phone number.Range: (0-100). 100 means exact match",
    },
  ];
  return <DataCard header={HEADER} attributes={attributes} />;
};

export default CustomerPhone;
