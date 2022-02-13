import React from "react";
import styled from "styled-components";

import googleLogo from "../../utils/logo/google.svg";
import msLogo from "../../utils/logo/ms.svg";

const StyledButton = styled.div`
  width: 382px;
  height: 48px;
  background: #2173ff;
  max-width: 100%;
  border-radius: 4px;
  border: none;
  display: flex;
  margin: 8px 0px;
  cursor: pointer;
  @media (max-width: 760px) {
  }
`;

const StyledDiv = styled.div`
  color: #ffffff;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */

  font-feature-settings: "ss02" on;

  /* White */

  margin: auto;
  // @media (max-width: 760px) {
  // }
`;

const LoginLogo = styled.div`
  width: 40px;
  height: 40px;
  background: #ffffff;
  margin: 4px;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.168), 0px 0px 1px rgba(0, 0, 0, 0.084);
  border-radius: 3px;
`;

const Button = ({ type, onClick, className }) => (
  <StyledButton onClick={onClick} className={className}>
    <LoginLogo className="logo-parent">
      <img alt="" style={{ margin: "12px" }} src={type === "google" ? googleLogo : msLogo} />
    </LoginLogo>
    <StyledDiv className="btn-text">{type === "google" ? "Sign in with Google" : "Sign in with Microsoft"}</StyledDiv>
  </StyledButton>
);

export default Button;
