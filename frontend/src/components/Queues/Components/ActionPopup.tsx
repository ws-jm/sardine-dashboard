import { StyledNavTitle, StyledTitleName } from "components/Dashboard/styles";
import { ErrorText } from "components/RulesModule/styles";
import React, { useState } from "react";
import { Modal, Button, Spinner, Dropdown } from "react-bootstrap";
import { CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { updateCaseStatus } from "utils/api";
import { getErrorMessage } from "utils/errorUtils";

interface IPopupProps {
  show: boolean;
  data: CustomersResponse[];
  checkpoint: string;
  queueName: string;
  handleClose: () => void;
  handleSuccess: () => void;
}

interface IActionsDropdownProps {
  actionsValue: string[];
  onValuesUpdated(values: string[]): void;
}

const DROPDOWN_VALUES = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  RESOLVED: "resolved",
  NONE: "none",
  APPROVE: "approve",
  DECLINE: "decline",
};

export const actions = [
  {
    key: "status",
    title: "Case Status",
    values: [DROPDOWN_VALUES.PENDING, DROPDOWN_VALUES.IN_PROGRESS, DROPDOWN_VALUES.RESOLVED],
  },
  {
    key: "decision",
    title: "Decision",
    values: [DROPDOWN_VALUES.NONE, DROPDOWN_VALUES.APPROVE, DROPDOWN_VALUES.DECLINE],
  },
] as const;

export const ActionsDropDown: React.FC<IActionsDropdownProps> = (props) => {
  const { actionsValue, onValuesUpdated } = props;
  const result = actions.map((a, ind) => (
    <div style={{ marginBottom: 20 }} key={a.key}>
      <StyledTitleName style={{ marginBottom: 5 }}>{a.title}</StyledTitleName>
      <Dropdown>
        <Dropdown.Toggle
          style={{
            backgroundColor: "#F0F3F9",
            border: "none",
            color: "#325078",
            width: "70%",
            textAlign: "left",
            height: 50,
            borderRadius: 16,
          }}
        >
          <span style={{ paddingLeft: 20, textTransform: "capitalize" }}>
            {actionsValue[ind].length > 0 ? actionsValue[ind] : "Select"}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ width: "70%" }}>
          {a.values.map((v) => (
            <Dropdown.Item
              key={`${a.key}-${v}`}
              style={{ textTransform: "capitalize" }}
              onClick={() => {
                const arr = [...actionsValue];
                arr[ind] = v;
                if ([DROPDOWN_VALUES.APPROVE, DROPDOWN_VALUES.DECLINE].includes(v) && arr.length > 1) {
                  arr[0] = DROPDOWN_VALUES.RESOLVED;
                }
                onValuesUpdated(arr);
              }}
            >
              {v}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  ));

  return <>{result}</>;
};

const ActionPopup: React.FC<IPopupProps> = (props) => {
  const { show, data, checkpoint, queueName, handleClose, handleSuccess } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionsValue, setActionsValue] = useState<string[]>(Array(actions.length).fill(""));

  const submitApiCall = async () => {
    setIsLoading(true);
    setError("");

    const clientID = data.length > 0 ? data[0].client_id : "";
    const actionData: { [key: string]: string } = {};
    actions.forEach((a, ind) => {
      actionData[a.key] = actionsValue[ind];
    });

    try {
      await updateCaseStatus(
        data.map((d) => d.customer_id ?? ""),
        data.map((d) => d.session_key ?? ""),
        clientID,
        actionData,
        checkpoint,
        data.map((d) => d.transaction_id ?? ""),
        queueName
      );
      setActionsValue(Array(actions.length).fill(""));
      setIsLoading(false);
      handleSuccess();
    } catch (err) {
      setIsLoading(false);
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Body>
        <StyledNavTitle style={{ width: "100%", marginLeft: 30 }}>
          <StyledTitleName style={{ fontSize: 32, fontWeight: "normal", paddingTop: 20 }}>
            Actions
            <StyledTitleName
              style={{
                fontSize: 14,
                fontWeight: "normal",
                color: "#B9C5E0",
                marginTop: 10,
              }}
            >
              Here you can change actions for each feilds.
            </StyledTitleName>
          </StyledTitleName>
        </StyledNavTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoRows: "max-content",
            margin: 30,
            width: "100%",
          }}
        >
          <ActionsDropDown
            actionsValue={actionsValue}
            onValuesUpdated={(arr) => {
              setActionsValue(arr);
            }}
          />
        </div>

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
          <Button
            style={{ width: 120, backgroundColor: "#2173FF" }}
            disabled={actionsValue.filter((a) => a.length === 0).length > 0}
            onClick={submitApiCall}
          >
            {isLoading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              <span>Save details</span>
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ActionPopup;
