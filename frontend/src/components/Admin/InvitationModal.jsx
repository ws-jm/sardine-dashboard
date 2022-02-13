import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { fetchInvitations } from "../../utils/api";
import { captureException } from "../../utils/errorUtils";
import { ModalHeader } from "./styles";
import Organisation from "./Organisation";
import InviteEmail from "./InviteEmail";

const InvitationModal = ({ show, handleClose, organisation }) => {
  const [data, setData] = useState([]);

  const [openInviteModal, setInviteModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (organisation && organisation.name) {
      const data = await fetchInvitations(organisation.name);
      setData(data);
    }
  }, [organisation]);

  useEffect(() => {
    fetchData().then().catch((e) => captureException(e));
  }, [fetchData]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <InviteEmail
        show={openInviteModal}
        handleClose={() => {
          setInviteModal(false);
          fetchData().then().catch((e) => captureException(e));
        }}
        organisation={organisation}
      />
      <Modal.Header closeButton>
        <Modal.Title>
          <ModalHeader>{organisation.name}</ModalHeader>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Organisation id={organisation.name} data={data} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => setInviteModal(true)}>
          Generate email invite
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvitationModal;
