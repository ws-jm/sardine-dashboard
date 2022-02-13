import React, { useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { randomId } from "../../utils/idUtils";

interface Props {
  code: string;
  description: string;
}

const ReasonCode = (props: Props): JSX.Element => {
  const { code, description } = props;
  const id = useMemo(() => randomId(`${code}-`), [code]);
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{description}</Tooltip>}>
      <a
        id={`link_${code}`}
        href={`https://docs.sardine.ai/reasoncodes/#${code}`}
        style={{ margin: "0px 3px", color: "#325078" }}
      >
        {code}
      </a>
    </OverlayTrigger>
  );
};

export default ReasonCode;
