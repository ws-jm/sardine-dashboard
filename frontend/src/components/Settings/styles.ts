import styled from "styled-components";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

export const ModalText = styled.div`
  font-family: IBM Plex Sans;
  text-align: center;
`;

export const StyledContainer = styled(Container)`
  margin-top: 24px;
  margin-left: 24px;
`;

export const StyledRow = styled(Row)`
  margin: 12px 0;
`;

export const StyledButton = styled(Button)`
  min-width: 160px;
`;

export const DashedLine = styled.div`
  margin: 30px;
  height: 1px;
  border-style: dashed;
  border-width: 0.5px;
  width: 100%;
  border-color: grey;
`;
