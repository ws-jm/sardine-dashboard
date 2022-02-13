import React from "react";
import ReasonCodeList from "components/ReasonCodeList";
import { AllReasonCodes } from "./reasoncodes";

export const renderReasonCodesFromArray = (reasonCodeArray: Array<string>): JSX.Element | "-" => {
  if (reasonCodeArray.length === 0) {
    return "-";
  }
  const reasonCodes = reasonCodeArray.map((code) => ({
    code,
    description: AllReasonCodes[code],
  }));
  return <ReasonCodeList reason_codes={reasonCodes} />;
};

export const renderReasonCodes = (reasonCodesArg: string): JSX.Element | "-" => {
  const reasonCodesStr = reasonCodesArg.replace(/ /g, "");
  if (reasonCodesStr.length === 0) {
    return "-";
  }
  return renderReasonCodesFromArray(reasonCodesStr.split(",").map((v) => v.replace(/"/, "")));
};
