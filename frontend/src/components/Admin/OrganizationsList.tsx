import React, { useState } from "react";
import { Button, FormControl } from "react-bootstrap";
import { Organization, OrganizationUser, OrganizationAction, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { TableWrapper } from "./styles";
import { DataTable } from "../Common/DataTable";
import UsersList from "./UsersList";

interface IProps {
  data: Organization[];
  isLoading: boolean;
  showCredentialsModal: (data: OrganizationAction) => void;
  showInvitationModal: (data: OrganizationAction) => void;
  onUserRemoved: (user: OrganizationUser, index: number) => void;
}

const OrganizationsList: React.FC<IProps> = (props) => {
  const [searchString, setSearchString] = useState("");

  const { data, isLoading, onUserRemoved, showCredentialsModal, showInvitationModal } = props;

  const tableData = data.map ? data.map((d, index) => ({ index, name: d.name })) : [];
  const columnsData = [
    {
      title: "ORGANIZATIONS",
      field: "name",
      grouping: false,
    },
    {
      title: "ACTIONS",
      field: "credentials",
      grouping: false,
      render: (rowData: OrganizationAction) => (
        <>
          <Button
            style={{ width: "max-content", marginRight: 15 }}
            variant="primary"
            onClick={() => showCredentialsModal(rowData)}
          >
            View Credentials
          </Button>
          <Button style={{ width: "max-content" }} variant="primary" onClick={() => showInvitationModal(rowData)}>
            View Invitations
          </Button>
        </>
      ),
    },
  ];

  const getFilteredData = () => tableData.filter((org) => org.name.toLowerCase().includes(searchString.toLowerCase()));

  return (
    <TableWrapper>
      <FormControl
        type="text"
        placeholder="Search here"
        value={searchString}
        style={{
          margin: "20px 0px",
          height: 40,
        }}
        onChange={(event) => {
          const text = event.target.value;
          setSearchString(text);
        }}
      />
      <DataTable
        columns={columnsData}
        data={getFilteredData()}
        title=""
        isLoading={isLoading}
        options={{
          grouping: false,
          exportAllData: false,
          sorting: false,
          paging: false,
        }}
        detailPanel={(rowData: AnyTodo) => {
          const { index } = rowData.rowData as OrganizationAction;
          return (
            <UsersList
              data={(data.length > index && data[index].users) || []}
              onUserRemoved={(user) => onUserRemoved(user, index)}
            />
          );
        }}
        components={{
          Toolbar: () => null,
        }}
      />
    </TableWrapper>
  );
};

export default OrganizationsList;
