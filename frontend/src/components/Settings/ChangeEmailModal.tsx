import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import firebase from "../../utils/firebase";
import { ModalText } from "./styles";

const ChangeEmailModal = ({
  show,
  handleClose,
  oldEmail,
}: {
  show: AnyTodo;
  handleClose: () => void;
  oldEmail: string;
}): JSX.Element => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await firebase.validatePassword(oldEmail, password);
    } catch (e) {
      setErrorMessage("Password incorrect");
    }
    await firebase.updateEmail(email);
    setSuccessMessage("Email change success. Please check your email for completing verification.");
  };

  const updateEmail = (e: React.ChangeEvent<AnyTodo>) => {
    setEmail(e.target.value);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <ModalText>Change Email</ModalText>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Form onSubmit={changeEmail}>
          <Form.Group controlId="newEmail">
            <Form.Label>New Email</Form.Label>
            <Form.Control type="email" name="email" onChange={updateEmail} placeholder="Enter email" />
          </Form.Group>
          <Form.Group controlId="newEmail">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter email"
            />
            <Form.Text className="text-muted">Password is required for email change</Form.Text>
          </Form.Group>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeEmailModal;
