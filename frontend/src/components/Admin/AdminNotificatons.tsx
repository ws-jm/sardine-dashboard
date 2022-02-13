import React, { useState, useEffect } from "react";
import { Button, FormControl, Spinner } from "react-bootstrap";
import { EmailConfig, Organization, OrganizationUser } from "sardine-dashboard-typescript-definitions";
import { captureException } from "utils/errorUtils";
import { ChipCancelButton, ChipContainer, ChipWrapper, Line, StyledUl } from "components/RulesModule/styles";
import { useToasts } from "react-toast-notifications";
import { selectIsSuperAdmin, useUserStore } from "store/user";
import { CheckboxContainer, TableWrapper, Title, UsersContainer } from "./styles";
import { DataTable } from "../Common/DataTable";
import Layout from "../Layout/Main";
import { getAdminOrganisations, sendAdminNotification } from "../../utils/api";
import RadioButton from "../Common/RadioButton";

const AdminNotificatons: React.FC = () => {
  const [searchString, setSearchString] = useState("");
  const [fetchOrg, setFetchOrg] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [organisations, setOrganisations] = useState<Organization[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<OrganizationUser[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { addToast } = useToasts();

  const isSuperAdmin = useUserStore(selectIsSuperAdmin);

  const columnsData = [
    {
      title: "ORGANIZATION",
      field: "name",
    },
    {
      title: "USERS",
      field: "users",
      render: (rowData: Organization) => (
        <UsersContainer>
          {rowData.users &&
            rowData.users.map((user) => (
              <CheckboxContainer key={`${user.id}`}>
                <RadioButton
                  title={user.name}
                  selected={selectedUsers.map((u) => u.id).includes(user.id)}
                  isCheckBox
                  onClick={() => {
                    if (selectedUsers.map((u) => u.id).includes(user.id)) {
                      const updatedList = selectedUsers.filter((u) => u.id !== user.id);
                      setSelectedUsers(updatedList);
                    } else {
                      setSelectedUsers([...selectedUsers, user]);
                    }
                  }}
                />
              </CheckboxContainer>
            ))}
        </UsersContainer>
      ),
    },
  ];

  useEffect(() => {
    async function loadOrganisations() {
      setFetchOrg(false);
      setIsLoading(true);
      const result = await getAdminOrganisations();
      setIsLoading(false);
      const data = Array(result);
      if (data.length > 0) {
        setOrganisations(data[0]);
      }
    }

    if (fetchOrg) {
      loadOrganisations()
        .then()
        .catch((e) => captureException(e));
    }
  }, [fetchOrg]);

  if (!isSuperAdmin) {
    return <>unauthorized</>;
  }

  const submitAction = async () => {
    const users: EmailConfig[] = selectedUsers.map((u) => ({
      name: u.name,
      email: u.email,
    }));
    try {
      setSendingNotification(true);
      await sendAdminNotification(subject, users, message);
      addToast("Notification sent successfully!", {
        appearance: "success",
        autoDismiss: true,
      });
      setSubject("");
      setMessage("");
      setSelectedUsers([]);
    } catch (error) {
      captureException(error);
      addToast(`${error}`, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setSendingNotification(false);
    }
  };

  const filteredOrganizations = organisations.filter((org) => org.users.length > 0);
  const getFilteredData = () =>
    filteredOrganizations.filter((org) => org.name.toLowerCase().includes(searchString.toLowerCase()));

  return (
    <Layout>
      <Title style={{ margin: 30, fontSize: 20 }}>Send email notification to clients</Title>
      <TableWrapper>
        <FormControl
          type="text"
          placeholder="Subject"
          value={subject}
          style={{
            margin: "20px 0px",
            height: 40,
          }}
          onChange={(event) => {
            const text = event.target.value;
            setSubject(text);
          }}
        />
        <FormControl
          type="text"
          name="value"
          as="textarea"
          value={message}
          placeholder="Type here (only message user name will be added)"
          style={{ minHeight: 150, marginRight: 10 }}
          onChange={(event) => setMessage(event.target.value)}
        />

        <StyledUl style={{ justifyContent: "space-between", margin: 10 }}>
          <ChipWrapper>
            {" "}
            {selectedUsers.map((user) => (
              <ChipContainer key={user.id}>
                {user.name}
                <ChipCancelButton
                  onClick={() => {
                    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
                  }}
                >
                  ×
                </ChipCancelButton>{" "}
              </ChipContainer>
            ))}{" "}
          </ChipWrapper>
          <Button
            style={{ minWidth: "fit-content", marginRight: 15 }}
            disabled={subject.trim().length === 0 || message.trim().length === 0 || selectedUsers.length === 0}
            variant="primary"
            onClick={() => submitAction()}
          >
            {sendingNotification ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              <span>Send Message</span>
            )}
          </Button>
        </StyledUl>
        <Line />
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
          components={{
            Toolbar: () => null,
          }}
        />
      </TableWrapper>
    </Layout>
  );
};

export default AdminNotificatons;
