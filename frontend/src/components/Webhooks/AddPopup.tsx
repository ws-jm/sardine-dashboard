import React, { useState } from "react";
import { Modal, Button, FormControl, Spinner, Row } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import OrganisationDropDown from "components/Dropdown/OrganisationDropDown";
import { isUrlValid } from "components/Common/Functions";
import { addWebhook } from "../../utils/api";
import { ErrorText } from "../RulesModule/styles";
import { Title } from "./styles";

interface IProps {
  show: boolean;
  handleClose: () => void;
  handleSuccess: () => void;
}

const AddPopup: React.FC<IProps> = (props) => {
  const [webhookLink, setWebhookLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const { addToast } = useToasts();

  const { show, handleClose, handleSuccess } = props;

  const addOrganisation = async () => {
    const newLink = webhookLink.split(" ").join("").toLowerCase();
    if (!isUrlValid(newLink)) return setError("Please enter valid webhook url");

    try {
      setIsLoading(true);

      await addWebhook({
        organisation: selectedOrg,
        url: webhookLink,
      });

      setIsLoading(false);
      setWebhookLink("");

      addToast("Webhook added successfully!!", {
        appearance: "success",
        autoDismiss: true,
      });

      handleSuccess();
    } catch (e) {
      setIsLoading(false);
      setError(`${e}`);
    }

    return true;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Provide details to add webhook</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row style={{ margin: 15, alignItems: "center" }}>
          <div style={{ paddingRight: 20 }}>
            <Title>Webhook URL: </Title>
          </div>
          <FormControl
            placeholder="Type here"
            aria-describedby="basic-addon2"
            type="url"
            style={{ maxWidth: 400, minWidth: 200 }}
            onChange={(event) => {
              setWebhookLink(event.target.value);
              setError("");
            }}
          />
        </Row>
        <Row style={{ margin: 15, alignItems: "center" }}>
          <div style={{ paddingRight: 20 }}>
            <Title>Organization: </Title>
          </div>
          <div style={{ zIndex: 20 }}>
            <OrganisationDropDown
              changeOrganisation={(organisation: string) => setSelectedOrg(organisation)}
              organisation={selectedOrg}
            />
          </div>
        </Row>
        {error.length > 0 ? <ErrorText style={{ paddingLeft: 15 }}>{error}</ErrorText> : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Dismiss
        </Button>
        <Button
          variant="primary"
          type="submit"
          onClick={() => addOrganisation()}
          disabled={webhookLink.length === 0 || selectedOrg.length === 0}
        >
          {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <span>Create</span>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddPopup;
