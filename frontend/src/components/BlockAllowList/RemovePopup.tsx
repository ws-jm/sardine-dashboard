import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import styled from "styled-components";
import { getErrorMessage } from "utils/errorUtils";
import { RowItem, BlocklistProps } from "./RowItem";
import { StyledTable, StyledTh } from "./styles";
import { getHeaders } from "./BlockAllowListUtils";
import { deleteBlocklist, deleteAllowlist } from "../../utils/api";
import { ErrorText } from "../RulesModule/styles";
import { convertType } from "./AddNew";

const ModalText = styled.div`
  font-family: IBM Plex Sans;
  text-align: center;
`;

interface IPopupProps {
  show: boolean;
  data: BlocklistProps;
  isBlockList: boolean;
  organisation: string;
  handleClose: () => void;
  handleSuccess: () => void;
}

const RemovePopup = (p: IPopupProps): JSX.Element => {
  const { isBlockList, organisation, show, data, handleClose } = p;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = getHeaders(isBlockList);
  headers.pop();

  const removeApiCall = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (p.isBlockList) await deleteBlocklist(data.id, organisation);
      else await deleteAllowlist(data.id, organisation);

      p.handleSuccess();
    } catch (err) {
      setIsLoading(false);
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header
        style={{
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <ModalText
          style={{
            fontSize: 18,
            textAlign: "center",
            fontWeight: "bold",
            margin: 5,
          }}
        >
          Are you sure about removing the below device?
        </ModalText>
      </Modal.Header>
      <Modal.Body>
        <StyledTable style={{ margin: 10 }}>
          <thead>
            <tr>
              {headers.map((ele) => (
                <StyledTh key={ele}>{ele}</StyledTh>
              ))}
            </tr>
          </thead>
          <tbody>
            <RowItem
              id={data.id}
              type={convertType(data.type, false)}
              value={data.value}
              expiry={data.expiry}
              scope={data.scope}
              created_at={data.created_at}
              isRemove
              onClick={handleClose}
            />
          </tbody>
        </StyledTable>
        {error.length > 0 ? <ErrorText style={{ textTransform: "capitalize" }}>{error}</ErrorText> : null}
        <div style={{ justifyContent: "flex-end", display: "flex" }}>
          <Button
            style={{
              backgroundColor: "transparent",
              marginRight: 10,
              color: "#2173FF",
              width: 80,
              border: "none",
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button style={{ width: 80, backgroundColor: "#2173FF" }} onClick={removeApiCall}>
            {isLoading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              <span>Remove</span>
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RemovePopup;
