import styled from "styled-components";
import { Table, Button, Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

export const StyledTable = styled(Table)`
  border-collapse: collapse;
  table-layout: auto;
  width: -webkit-fill-available;
  td {
    vertical-align: unset !important;
  }
`;

export const StyledTh = styled.th`
  height: 16px;
  padding: 0px 8px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  /* identical to box height */

  /* Secondary */
  color: #909bad;
`;

export const StyledTr = styled.tr`
  height: 36px;

  border-radius: 4px;
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  font-feature-settings: "ss02" on, "zero" on;
  color: #909bad;
  padding: 9px 0px;
  background-color: #ffffff;
  align-items: center;
`;

export const StyledTd = styled.td`
  height: 20px;
  padding: 0px 8px;
`;

export const TableWrapper = styled.div`
  max-width: 800px;
  margin: 24px;
`;

export const ModalHeader = styled.div`
  font-family: IBM Plex Sans;
  text-transform: uppercase;
  text-align: center;
`;

export const StyledContainer = styled(Container)`
  margin-top: 24px;
  margin-left: 24px;
`;

export const StyledRow = styled(Row)`
  margin: 12px 0;
`;

export const TableTitle = styled.div`
  font-weight: 400;
  font-size: 16px;
`;

export const TitleWrapper = styled.div`
  margin: 12px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const StyledButton = styled(Button)``;

export const StyledInput = styled(Form.Control)``;

export const Title = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  font-feature-settings: "ss02" on;
  color: var(--dark-14);
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-items: flex-end;
  flex-direction: row-reverse;
  max-width: 800px;
`;

export const UsersContainer = styled.div`
  max-height: 250px;
  overflow-y: scroll;
`;

export const CheckboxContainer = styled.div`
  .form-check-input {
    width: 20px !important;
    height: 20px !important;
    margin: 2px 0 0 !important;
    cursor: pointer !important;
  }

  .form-check-input:checked {
    background-color: #0d6efd !important;
  }

  .form-check-label {
    font-weight: 500 !important;
    font-size: 14px !important;
    line-height: 18px !important;
    padding-left: 5px;
    padding-top: 3px;
  }

  .form-check {
    padding-left: 30px !important;
  }
`;
