import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import styled from "styled-components";

const ModalText = styled.div`
  font-family: IBM Plex Sans;
  text-align: center;
`;

interface IProps {
  show: boolean;
  title?: string;
  message: string;
  isLoading?: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const PopUp: React.FC<IProps> = (props) => {
  const { show, message, title, isLoading, handleClose, handleSubmit } = props;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header style={{ alignItems: "center", flexDirection: "column", justifyContent: "center" }}>
        <ModalText style={{ fontSize: 18, textAlign: "center", fontWeight: "bold", margin: 5 }}>{title || "Alert"}</ModalText>
        <ModalText style={{ fontSize: 16, margin: 5 }}> {message} </ModalText>
      </Modal.Header>
      <Modal.Body>
        <div style={{ justifyContent: "flex-end", display: "flex" }}>
          <Button style={{ backgroundColor: "lightgrey", marginRight: 10, width: 80, borderWidth: 0 }} onClick={handleClose}>
            No
          </Button>
          <Button style={{ width: 80 }} onClick={isLoading ? () => {} : handleSubmit}>
            {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Yes"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PopUp;
