import { useEffect, useState } from "react";
import { useUserStore } from "store/user";
import { Modal, Button, FormControl, Spinner, Form, Row } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import { MULTI_ORG_ADMIN, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { captureException, getErrorMessage } from "utils/errorUtils";
import { createOrganisaion, getAllAdminUsers } from "../../utils/api";
import { ErrorText } from "../RulesModule/styles";
import { Title } from "./styles";
import RecursiveDropdown from "../Common/RecursiveDropdown";
import { DATA_TYPES } from "../../utils/dataProviderUtils";

interface IProps {
  show: boolean;
  isSuperAdmin: boolean;
  handleClose: () => void;
  handleSuccess: (data: AnyTodo) => void;
}

interface IAdminUsers {
  client_id: string;
  display_name: string;
}

const CreateOrganization = (p: IProps) => {
  const { isSuperAdmin, show, handleClose, handleSuccess } = p;
  const organisation = useUserStore(({ organisation }) => organisation);
  const [newOrganisation, setNewOrganisation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [users, setUsers] = useState<IAdminUsers[]>([{ client_id: "", display_name: "none" }]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const { addToast } = useToasts();

  useEffect(() => {
    async function loadUsers() {
      try {
        setUsersLoaded(true);
        const { result } = await getAllAdminUsers();
        if (result) {
          setUsers((prevState) => [...prevState, ...result]);
        }
      } catch (e) {
        const errorMessage = getErrorMessage(e);
        addToast(`${errorMessage}`, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }

    if (!usersLoaded && isSuperAdmin) {
      loadUsers()
        .then()
        .catch((e) => {
          captureException(e);
        });
    }
  }, [usersLoaded, isSuperAdmin, addToast]);

  const addOrganisation = async () => {
    let newLink = newOrganisation.split(" ").join("").toLowerCase();
    newLink = newLink.replace(/[^\w\s]/gi, "");
    if (!newLink) return setError("Please enter organization name");

    try {
      setIsLoading(true);
      const parent = isSuperAdmin ? (isAdmin || selectedOrg.toLowerCase() === "none" ? "" : selectedOrg) : organisation;

      const data = await createOrganisaion({
        organisation: newOrganisation,
        user_type: isAdmin ? MULTI_ORG_ADMIN : "user",
        parentOrg: parent,
      });

      setIsLoading(false);
      setNewOrganisation("");

      addToast("Organization created successfully!!", {
        appearance: "success",
        autoDismiss: true,
      });

      handleSuccess(data);
    } catch (e) {
      setIsLoading(false);
      setError(`${e}`);
    }
    return undefined; // async function must return something
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Enter details to create new organization</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormControl
          placeholder="Name"
          aria-describedby="basic-addon2"
          type="name"
          style={{ maxWidth: 400, minWidth: 200 }}
          onChange={(event) => {
            setNewOrganisation(event.target.value);
            setError("");
          }}
        />
        {error.length > 0 ? <ErrorText style={{ textTransform: "capitalize" }}>{error}</ErrorText> : null}

        {isSuperAdmin ? (
          <>
            <Row style={{ margin: 15, alignItems: "center" }}>
              <div style={{ paddingRight: 20 }}>
                <Title>User Type:</Title>
              </div>
              <Form>
                <Form.Check
                  inline
                  label="User"
                  type="radio"
                  id="inline-radio-1"
                  onChange={() => setIsAdmin(!isAdmin)}
                  checked={!isAdmin}
                />
                <Form.Check
                  inline
                  label="Admin"
                  type="radio"
                  id="inline-radio-2"
                  onChange={() => setIsAdmin(!isAdmin)}
                  checked={isAdmin}
                />
              </Form>
            </Row>
            {isAdmin ? null : (
              <Row style={{ margin: 15, alignItems: "center" }}>
                <div style={{ paddingRight: 20 }}>
                  <Title>Parent (Optional):</Title>
                </div>
                <RecursiveDropdown
                  show={openDropDown}
                  onDropdownClicked={() => {
                    setOpenDropDown(!openDropDown);
                  }}
                  onItemClicked={(val) => {
                    setSelectedOrg(val);
                    setOpenDropDown(false);
                  }}
                  value={selectedOrg.length === 0 ? "None" : selectedOrg}
                  data={users.map((u: IAdminUsers) => ({
                    title: u.display_name,
                    items: [],
                    datatype: DATA_TYPES.string,
                  }))}
                />
              </Row>
            )}
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" onClick={() => addOrganisation()} disabled={newOrganisation.length === 0}>
          {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <span>Create</span>}
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Dismiss
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOrganization;
