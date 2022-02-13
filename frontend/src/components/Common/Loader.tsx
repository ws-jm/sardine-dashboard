import React from "react";
import { Spinner } from "react-bootstrap";
import styled from "styled-components";

const StyledTitleName = styled.p`
  margin: auto 0px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
  line-height: 26px;
  color: var(--dark-14);
`;

const Loader = ({ height }: { height?: string | number }): JSX.Element => (
  <div
    className="loader"
    id="loader"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      height: height || "100vh",
      opacity: 0.7,
    }}
  >
    <Spinner animation="border" role="status" variant="primary" />
    <StyledTitleName style={{ textAlign: "center", marginLeft: 10 }}>Loading...</StyledTitleName>
  </div>
);

export default Loader;
