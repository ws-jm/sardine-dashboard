import { KEY_TAX_ID_DETAILS } from "components/Customers/UserView";
import React from "react";
import DataCard, { CardAttribute } from "../DataCard";

interface CustomerTaxDetailsProps {
  abuseScore: number;
  firstPartySyntheticScore: number;
  idTheftScore: number;
  nameDobSharedCount: number;
  nameSsnSyntheticAddress: boolean;
  ssnBogus: boolean;
  ssnHistoryLongerMonths: number;
  ssnIssuanceBeforeDob: boolean;
  ssnIssuanceDobMismatch: boolean;
  ssnSharedCount: number;
  ssnNamesExactMatch: string[];
  ssnPhonesExactMatch: string[];
  ssnEmailsExactMatch: string[];
  ssnDobsExactMatch: string[];
  taxId: string;
  taxIdLevel: string;
  taxIdMatch: string;
  taxIdNameMatch: string;
  taxIdDobMatch: string;
  taxIdStateMatch: string;
  thirdPartySyntheticScore: string;
}

const CustomerTaxDetails = (props: CustomerTaxDetailsProps): JSX.Element => {
  const {
    abuseScore,
    firstPartySyntheticScore,
    idTheftScore,
    nameDobSharedCount,
    nameSsnSyntheticAddress,
    ssnBogus,
    ssnHistoryLongerMonths,
    ssnIssuanceBeforeDob,
    ssnIssuanceDobMismatch,
    ssnSharedCount,
    ssnNamesExactMatch,
    ssnPhonesExactMatch,
    ssnEmailsExactMatch,
    ssnDobsExactMatch,
    taxId,
    taxIdLevel,
    taxIdMatch,
    taxIdNameMatch,
    taxIdDobMatch,
    taxIdStateMatch,
    thirdPartySyntheticScore,
  } = props;

  const attributes: CardAttribute[] = [
    {
      key: "Abuse Score",
      value: abuseScore,
      toolTip:
        "The identity is synthetic or the identity has previously been associated with fraudulent behaviors such as the purchase of authorized user tradelines. Between 0-1000, higher the riskier",
    },
    {
      key: "First Party Synthetic Score",
      value: firstPartySyntheticScore,
      toolTip:
        "The identity is a first party synthetic. The application consists of a true name and DOB but a fictitious SSN. Commonly used when the applicant is trying to hide parts of their true profile. Between 0-1000, higher the riskier",
    },
    {
      key: "Third Party Synthetic Score",
      value: thirdPartySyntheticScore,
      toolTip:
        "The identity is a first party synthetic. The application consists of a true name and DOB but a fictitious SSN. Commonly used when the applicant is trying to hide parts of their true profile. Between 0-1000, higher the riskiers",
    },
    {
      key: "Id Theft Score",
      value: idTheftScore,
      toolTip: "The identity is a victim of ID theft. Between 0-1000, higher the riskier",
    },
    { key: "Name Dob Shared Count", value: nameDobSharedCount, toolTip: "Name SSN shared count" },
    { key: "Name Ssn Synthetic Address", value: nameSsnSyntheticAddress, toolTip: "Name SSN Synthetic address" },
    { key: "Ssn Bogus", value: ssnBogus, toolTip: "SSN bogus" },
    { key: "Sss History Longer Months", value: ssnHistoryLongerMonths, toolTip: "SSN history longer months" },
    { key: "Ssn IssuanceBefore Dob", value: ssnIssuanceBeforeDob, toolTip: "SSN issurance before DOB" },
    { key: "Ssn Issuance Dob Mismatch", value: ssnIssuanceDobMismatch, toolTip: "SSN issurance DOB mismatch" },
    { key: "Ssn Shared Count", value: ssnSharedCount, toolTip: "SSN shared count" },
    { key: "Ssn Names Exact Match", value: ssnNamesExactMatch, toolTip: "SSN names exact match" },
    { key: "Ssn Phones Exact Match", value: ssnPhonesExactMatch, toolTip: "SSN phones exact match" },
    { key: "Ssn Emails Exact Match", value: ssnEmailsExactMatch, toolTip: "SSN emails exact match" },
    { key: "Ssn Dobs Exact Match", value: ssnDobsExactMatch.join(", "), toolTip: "SSN dobs exact match" },
    {
      key: "Tax Id",
      value: taxId,
      toolTip: "Customer's SSN, provided by you",
    },
    {
      key: "Tax Id Level",
      value: taxIdLevel,
      toolTip: "Overall riskiness level of taxID",
    },
    {
      key: "Tax Id Match",
      value: taxIdMatch,
      toolTip: "If given taxID matches with our record",
    },
    {
      key: "Tax Id Name Match",
      value: taxIdNameMatch,
      toolTip: "If given name matches with our taxID record",
    },
    {
      key: "Tax Id Dob Match",
      value: taxIdDobMatch,
      toolTip: "If given date of birth matches with our taxID record",
    },
    {
      key: "Tax Id State Match",
      value: taxIdStateMatch,
      toolTip: "If given state matches with our taxID record",
    },
  ];

  return <DataCard header={KEY_TAX_ID_DETAILS} attributes={attributes} />;
};

export default CustomerTaxDetails;
