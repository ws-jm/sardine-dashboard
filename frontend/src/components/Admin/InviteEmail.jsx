import React, { useState } from "react";
import { Modal, Button, FormControl, Spinner } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import { ErrorText } from "../RulesModule/styles";
import { generateSendInvite } from "../../utils/api";
import { REGISTER_PATH } from "../../modulePaths";

// eslint-disable-next-line prefer-regex-literals
const validateEmail = (emailAddress) => new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(emailAddress);

const validateEmails = (emails) => {
  let validated = true;
  for (let i = 0; i < emails.length && validated; i += 1) {
    if (!validateEmail(emails[i])) {
      validated = false;
    }
  }
  return validated;
};

const InviteEmail = ({ show, handleClose, organisation }) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToasts();

  const sendInvite = async () => {
    // Split by line breaks, commma, and spaces
    let emails = text.split(/[\n, ]/).filter((e) => e.length);
    emails = emails.map((email) => email.trim());

    if (!validateEmails(emails)) {
      setError("Invalid email");
      return;
    }

    try {
      setIsLoading(true);
      const link = `${import.meta.env.VITE_APP_FRONTEND_HOST}${REGISTER_PATH}`;

      await generateSendInvite(organisation.name, emails, link);

      setIsLoading(false);

      handleClose();

      addToast("Invitation sent successfully!!", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (err) {
      setIsLoading(false);
      setError(err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Enter emails to send invites</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormControl
          placeholder="Please enter one email per line"
          aria-describedby="basic-addon2"
          as="textarea"
          rows={4}
          style={{ maxWidth: 400, minWidth: 200 }}
          onChange={(event) => {
            setText(event.target.value);
            setError("");
          }}
        />
        {error.length > 0 ? <ErrorText style={{ textTransform: "capitalize" }}>{error}</ErrorText> : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" onClick={sendInvite} disabled={text.length === 0}>
          {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <span>Send</span>}
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Dismiss
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InviteEmail;
