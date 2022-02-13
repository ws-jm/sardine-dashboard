import React from "react";
import styled from "styled-components";
import { getCustomerProfilePath } from "../../utils/pathUtils";

export const Link = styled.a`
  color: #325078;
`;

export const CustomerProfileLink: React.FC<{ customerId: string; clientId: string; text?: string }> = ({
  customerId,
  clientId,
  text,
}) => (
  <Link href={getCustomerProfilePath({ customerId, clientId })} rel="noreferrer" target="_blank">
    {text === undefined ? customerId : text}
  </Link>
);
