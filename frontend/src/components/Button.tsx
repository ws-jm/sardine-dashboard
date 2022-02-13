import React from "react";
import { Button as BootStrapButton, ButtonProps } from "react-bootstrap";
import styled from "styled-components";

const StyledButton = styled(BootStrapButton)`
  &.btn-outline-secondary {
    border: none;
  }

  height: 40px;
  border-radius: 4px;
`;

export const H40Button = (props: ButtonProps) => <StyledButton {...props} />;

// This component is a wrapper of primary button.
// By using this component instead of directly use react-bootstrap Button,
// we can replace react-bootstrap with other better UI library in the future.
// We should make "#2173FF" a constant. Using theme is better. https://styled-components.com/docs/advanced#function-themes
export const PrimaryButton = styled(BootStrapButton)`
  background-color: #2173ff;
  text-transform: uppercase;
`;

export const W250Button = styled(H40Button)`
  width: 250px;
`;
