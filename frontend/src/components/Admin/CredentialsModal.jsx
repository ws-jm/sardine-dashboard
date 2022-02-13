import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { revokeCredentials, generateNewCredentials } from "../../utils/api";
import { TableWrapper, StyledTable, StyledTh, StyledTr, StyledTd, ModalHeader } from "./styles";

const CredentialsModal = ({ show, handleClose, organisation }) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [credential, setCredential] = useState(null);

  const revokeToken = async ({ uuid, clientID }) => {
    await revokeCredentials({ uuid, clientID });
    setShowCredentials(false);
    setCredential(null);
  };

  const copyCredentails = ({ secretKey, clientID }) => {
    const copyString = JSON.stringify({ secretKey, clientID });
    const el = document.createElement("textarea");
    el.value = copyString;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert("Copied");
  };

  const generateCredentials = async () => {
    const result = await generateNewCredentials({ organisation: organisation.name });
    setCredential(result);
    setShowCredentials(true);
  };

  const onHide = () => {
    setShowCredentials(false);
    setCredential(null);
    handleClose();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <ModalHeader>{organisation.name}</ModalHeader>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TableWrapper>
          <StyledTable responsive="md" bordered>
            <thead>
              <StyledTr>
                <StyledTh>Client Id</StyledTh>
                <StyledTh>Client Secret</StyledTh>
                <StyledTh>Is Active</StyledTh>
                <StyledTh>Revoke</StyledTh>
                <StyledTh>Copy</StyledTh>
              </StyledTr>
            </thead>
            <tbody>
              {showCredentials ? (
                <>
                  <StyledTr>
                    <StyledTd>{credential.clientID}</StyledTd>
                    <StyledTd>{credential.secretKey}</StyledTd>
                    <StyledTd>{credential.status === "ok" ? "Yes" : "No"}</StyledTd>
                    <StyledTd>
                      <Button disabled={credential.status !== "ok"} variant="danger" onClick={() => revokeToken(credential)}>
                        Revoke
                      </Button>
                    </StyledTd>
                    <StyledTd>
                      <Button variant="secondary" onClick={() => copyCredentails(credential)}>
                        Copy
                      </Button>
                    </StyledTd>
                  </StyledTr>
                  <StyledTr>
                    <StyledTd colSpan="5">
                      You should copy your secret key and keep it safe. We don't store it and once this popup is closed it will
                      never be displayed again.
                    </StyledTd>
                  </StyledTr>
                </>
              ) : (
                <StyledTr>
                  <StyledTd colSpan="5">No Credential Data</StyledTd>
                </StyledTr>
              )}
            </tbody>
          </StyledTable>
        </TableWrapper>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={generateCredentials}>
          Generate Credentials
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CredentialsModal;
