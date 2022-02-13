import { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { OrganizationUser } from "sardine-dashboard-typescript-definitions";
import { useToasts } from "react-toast-notifications";
import { StyledTable, StyledTh, StyledTr, StyledTd } from "./styles";
import { deleteUser } from "../../utils/api";
import PopUp from "../Common/PopUp";

interface IProps {
  data: OrganizationUser[];
  onUserRemoved: (user: OrganizationUser) => void;
}

const UsersList = (props: IProps): JSX.Element => {
  const { addToast } = useToasts();
  const [userToRemove, setUserToRemove] = useState<OrganizationUser>();
  const [showPopup, setShowPopup] = useState(false);

  const { data, onUserRemoved } = props;

  async function deleteOrgUser() {
    setShowPopup(false);
    if (userToRemove) {
      try {
        await deleteUser(userToRemove.id, userToRemove.organisation);
        setUserToRemove(undefined);

        addToast(`User removed successfully`, {
          appearance: "success",
          autoDismiss: true,
        });

        onUserRemoved(userToRemove);
      } catch (error) {
        setUserToRemove(undefined);
        addToast(`${error}`, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  }

  return data && data.length > 0 ? (
    <>
      <PopUp
        show={showPopup}
        title="Remove User"
        message="Are you sure you want to remove this user?"
        handleClose={() => {
          setShowPopup(false);
          setUserToRemove(undefined);
        }}
        handleSubmit={() => deleteOrgUser()}
      />
      <StyledTable>
        <thead>
          <StyledTr style={{ backgroundColor: "#fafbfd" }}>
            <StyledTh>Name</StyledTh>
            <StyledTh>Email</StyledTh>
            <StyledTh>Actions</StyledTh>
          </StyledTr>
        </thead>
        <tbody>
          {data.map((ele) => (
            <StyledTr key={ele.id}>
              <StyledTd>{ele.name}</StyledTd>
              <StyledTd>{ele.email}</StyledTd>
              <StyledTd>
                <Button
                  variant="danger"
                  style={{ color: "#fff" }}
                  onClick={() => {
                    setShowPopup(true);
                    setUserToRemove(ele);
                  }}
                >
                  {userToRemove && ele.id === userToRemove.id ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    "Remove"
                  )}
                </Button>
              </StyledTd>
            </StyledTr>
          ))}
        </tbody>
      </StyledTable>
    </>
  ) : (
    <div
      style={{
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold",
        color: "grey",
        margin: "20px 0px",
      }}
    >
      {" "}
      No users available!{" "}
    </div>
  );
};

export default UsersList;
