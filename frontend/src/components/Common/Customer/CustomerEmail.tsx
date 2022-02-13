import { renderReasonCodes } from "utils/renderReasonCodes";
import DataCard, { CardAttribute } from "../DataCard";

const HEADER = "Email Signals";

interface CustomerEmailProps {
  emailLevel: string;
  emailDomainLevel: string;
  emailReasonCodes: string;
  emailReason: string;
  emailOwnerName: string;
  emailOwnerNameMatch: string;
  emailPhoneRiskLevel: string;
  riskBand: string;
  billaddressReason: string;
}

const CustomerEmail = (props: CustomerEmailProps): JSX.Element => {
  const {
    billaddressReason,
    emailDomainLevel,
    emailLevel,
    emailOwnerName,
    emailOwnerNameMatch,
    emailPhoneRiskLevel,
    emailReason,
    emailReasonCodes,
    riskBand,
  } = props;

  const attributes: CardAttribute[] = [
    {
      key: "Email Level",
      value: emailLevel,
      toolTip: "Email risk level",
    },
    {
      key: "Email Domain Level",
      value: emailDomainLevel,
      toolTip: "Email domain risk level",
    },
    {
      key: "Email Reason Codes",
      value: renderReasonCodes(emailReasonCodes),
      toolTip: "Reason codes for email risk level",
    },
    {
      key: "Email Reason",
      value: emailReason,
      toolTip: "Email risk level summary",
    },
    {
      key: "Email Owner Name",
      value: emailOwnerName,
      toolTip: "User's name associated with email",
    },
    {
      key: "Email Owner Name Match",
      value: emailOwnerNameMatch,
      toolTip: "Match score of user's name, provided by you and name associated with email. Range: (1-4). 1 means exact match",
    },
    {
      key: "Email Phone Risk Level",
      value: emailPhoneRiskLevel,
      toolTip:
        "Phone risk level from Email Intelligence provider. Range: (1-3) and 6. 1 means very high risk and 6 means invalid phone",
    },
    {
      key: "Risk Band",
      value: riskBand,
      toolTip: "Riskiness of email. Range: (1-6), where 6 is the most high risk",
    },
    {
      key: "Billaddress Reason",
      value: billaddressReason,
      toolTip: "Billing address risk value. Range: (1-3) and 6. 1 means high risk and 6 means incomplete billing address",
    },
  ];
  return <DataCard header={HEADER} attributes={attributes} />;
};

export default CustomerEmail;
