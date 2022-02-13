import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import firebase from "../../utils/firebase";
import { captureException } from "../../utils/errorUtils";
import { ModalText } from "./styles";

const ChangePasswordModal = ({ show, handleClose, email }) => {
  const { register, handleSubmit, errors, setError } = useForm();
  // const [validated, setValidated] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const changePassword = (e) => {
    e.preventDefault();
    handleSubmit(async (data) => {
      try {
        if (data.newPassword !== data.confirmPassword) {
          setError("confirmPassword");
        }
        await firebase.validatePassword(email, data.oldPassword);
        await firebase.updatePassword(data.newPassword);
        setSuccessMessage("Password Changed!");
      } catch (e) {
        console.log(e);
        setError("oldPassword");
      }
    })(e).then().catch((e) => captureException(e));
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <ModalText>Change Password</ModalText>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Form onSubmit={changePassword}>
          <Form.Group controlId="oldPassword">
            <Form.Label>Old Password</Form.Label>
            <Form.Control
              required
              type="password"
              name="oldPassword"
              {...register("oldPassword", { required: true })}
              placeholder="Old Password"
            />
            {errors?.oldPassword && <Form.Control.Feedback type="invalid">Old Password is incorrect</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group controlId="newPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              required
              name="newPassword"
              {...register("newPassword", { required: true })}
              type="password"
              placeholder="New Password"
            />
            {errors?.newPassword && <Form.Control.Feedback type="invalid">New Password is required</Form.Control.Feedback>}
          </Form.Group>
          <Form.Group controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              name="confirmPassword"
              {...register("confirmPassword", { required: true })}
              required
              type="password"
              placeholder="Confirm Password"
            />
            {errors?.confirmPassword && <Form.Control.Feedback type="invalid">Passwords do not match</Form.Control.Feedback>}
          </Form.Group>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;
