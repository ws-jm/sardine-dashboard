import React from "react";
import ReasonCode from "../ReasonCode";

interface Props {
  reason_codes: Array<{
    code: string;
    description: string;
  }>;
}

const ReasonCodeList = (props: Props): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { reason_codes } = props;
  return (
    <span>
      {reason_codes.map((reasonCode) => (
        <ReasonCode key={reasonCode.code} code={reasonCode.code} description={reasonCode.description} />
      ))}
    </span>
  );
};

export default ReasonCodeList;
