import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import styled from "styled-components";
import { SessionKind, CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { getErrorMessage } from "utils/errorUtils";
import { replaceAllUnderscoresWithSpaces } from "utils/stringUtils";
import RadioButton from "../../Common/RadioButton";
import { addBlocklist, addAllowlist } from "../../../utils/api";
import { convertFieldsToBlockAllowList } from "../customersFormUtils";
import { defaultBlocklistExpiry, defaultAllowlistExpiry } from "../../BlockAllowList/AddNew";
import { ErrorText } from "../../RulesModule/styles";

const ModalText = styled.div`
  font-family: IBM Plex Sans;
  text-align: center;
`;

interface IProps {
  show: boolean;
  data?: CustomersResponse | SessionKind;
  client_id: string;
  handleClose: () => void;
  handleSuccess: (isBlocklist: boolean) => void;
}

const OPTIONS = ["customer_id", "device_id", "email_address", "phone", "device_ip"] as const;

const BLOCKLIST = "Blocklist" as const;
const ALLOWLIST = "Allowlist" as const;
const ACTION_TYPES = [BLOCKLIST, ALLOWLIST] as const;
type ActionType = typeof ACTION_TYPES[number];

const AccessControlPopUp: React.FC<IProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { handleClose, show, data, client_id, handleSuccess } = props;
  const [actionType, setActionType] = useState<ActionType>(BLOCKLIST);
  const [selectedFields, setSelectedFields] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const submitApiCall = async () => {
    if (selectedFields.length === 0) {
      setError("Please select any field");
      return;
    }
    setIsLoading(true);
    setError("");

    const isBlocklist = actionType === BLOCKLIST;

    const listData = convertFieldsToBlockAllowList(selectedFields);

    const payload = {
      organisation: "",
      client_id,
      data: listData,
      scope: "transaction", // TODO: Change when support scope level block-allowlist
      expiry: (isBlocklist ? defaultBlocklistExpiry : defaultAllowlistExpiry).toDateString(),
    };

    try {
      if (isBlocklist) {
        await addBlocklist(payload);
      } else {
        await addAllowlist(payload);
      }

      setIsLoading(false);
      setSelectedFields([]);
      handleSuccess(isBlocklist);
    } catch (e) {
      setIsLoading(false);
      setError(getErrorMessage(e));
    }
  };

  const getOptions = () => {
    const tmpOptions: { [key: string]: string } = {};
    OPTIONS.forEach((opt) => {
      if (data) {
        const filteredData = Object.entries(data).filter((d) => d[0] === opt);
        if (filteredData.length > 0) {
          const d = filteredData[0][1];
          if (d.length > 0) {
            tmpOptions[opt] = d;
          }
        }
      }
    });

    return Object.entries(tmpOptions);
  };

  return (
    <Modal id="action_model" show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header style={{ justifyContent: "center", padding: 5, alignItems: "center" }}>
        <ModalText style={{ marginRight: 10 }}> Action Type: </ModalText>
        {ACTION_TYPES.map((a) => (
          <span key={a} style={{ paddingRight: 10 }}>
            {/* Use span to set unique key */}
            <RadioButton
              selected={actionType === a}
              title={a}
              onClick={() => {
                setActionType(a);
              }}
            />
          </span>
        ))}
      </Modal.Header>
      <Modal.Body>
        {getOptions().map((opt) => {
          // Temporary fix. opt should be typed correctly. getOptions() is a bad idea.
          // Handling "opt[0].replaceAll is not a function" problem.
          // https://sentry.io/organizations/sardine/issues/?project=5709359
          // https://sardineai.slack.com/archives/C022Q1VQV55/p1634765911382900
          // String.prototype.replaceAll is a newly added function. Babel should have handle it, but
          // Babel might have failed to transpile it. We should avoid using replaceAll for now.
          if (opt && opt[0] && opt[0].replace && typeof opt[0].replace === "function") {
            return (
              <span key={opt[1]}>
                {/* Use span to set unique key */}
                <RadioButton
                  selected={selectedFields.filter((f) => f[0] === opt[0]).length > 0}
                  isCheckBox
                  title={`${replaceAllUnderscoresWithSpaces(opt[0])}: ${opt[1]}`}
                  onClick={() => {
                    if (selectedFields.filter((f) => f[0] === opt[0]).length > 0) {
                      setSelectedFields(selectedFields.filter((f) => f[0] !== opt[0]));
                    } else {
                      setSelectedFields([...selectedFields, opt]);
                    }
                    setError("");
                  }}
                />
              </span>
            );
          }
          return null;
        })}
        {error.length > 0 ? <ErrorText style={{ textTransform: "capitalize" }}>{error}</ErrorText> : null}
        <br />
        <div style={{ justifyContent: "flex-end", display: "flex" }}>
          <Button
            style={{
              backgroundColor: "lightgrey",
              marginRight: 10,
              width: 80,
              borderWidth: 0,
            }}
            onClick={handleClose}
          >
            Dismiss
          </Button>
          <Button style={{ width: 80 }} onClick={submitApiCall}>
            {isLoading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AccessControlPopUp;
