import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styled from "styled-components";

const ModalText = styled.div`
  font-family: IBM Plex Sans;
  text-align: center;
`;

const EmailVerificationModal = ({ sendVerificationEmail, handleClose, show }) => {
  const [sentEmail, setSentEmail] = useState(false);

  const handleClick = async () => {
    await sendVerificationEmail();
    setSentEmail(true);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <ModalText>Email verification needed</ModalText>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {sentEmail ? (
          <ModalText>Verification email sent.</ModalText>
        ) : (
          <ModalText>
            You have not verified your email. We have sent a verification link to your email. Click the button below to resend the
            link.
          </ModalText>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClick} disabled={sentEmail}>
          Resend verification email
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmailVerificationModal;
