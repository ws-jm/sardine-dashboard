import React from "react";
import moment from "moment";
import Col from "react-bootstrap/Col";
import { useToasts } from "react-toast-notifications";
import { selectIsAdmin, selectIsSuperAdmin, useUserStore } from "../../store/user";
import { StyledTable, StyledTh, StyledTr, StyledTd, TableWrapper, TableTitle, StyledRow } from "./styles";

const columns = [
  {
    key: "id",
    label: "Id",
  },
  {
    key: "token",
    label: "Token",
  },
  {
    key: "expired_at",
    label: "Expires At",
    formatter: (date) => moment(date).format("LLL"),
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "email",
    label: "Email",
  },
];

const Organisations = ({ data, onInviteClicked }) => {
  const { addToast } = useToasts();
  const { isAuthenticated, isAdmin, isSuperAdmin } = useUserStore((state) => {
    const { isAuthenticated } = state;
    return {
      isAuthenticated,
      isAdmin: selectIsAdmin(state),
      isSuperAdmin: selectIsSuperAdmin(state),
    };
  });

  if (!isAuthenticated || !isAdmin) {
    return <>unauthorized</>;
  }

  return (
    <TableWrapper>
      <StyledRow>
        <Col md="8">
          <TableTitle>Signup Invitations</TableTitle>
        </Col>
      </StyledRow>

      <StyledTable responsive="md" bordered>
        <thead>
          <StyledTr>
            {columns.map((col) => (
              <StyledTh key={col.key}>{col.label}</StyledTh>
            ))}
          </StyledTr>
        </thead>
        <tbody>
          {data.map((row) => (
            <StyledTr key={row.id}>
              {columns.map((col) => (
                <StyledTd key={`${col.key}_${row.id}`}>{col.formatter ? col.formatter(row[col.key]) : row[col.key]}</StyledTd>
              ))}
            </StyledTr>
          ))}
          {!data.length && (
            <StyledTr>
              <StyledTd colSpan="5">No Invitation Data</StyledTd>
            </StyledTr>
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default Organisations;
