import { useState, FC, useEffect } from "react";
import { Modal, Button, Spinner, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

import { Feedback, OrgAdminList } from "sardine-dashboard-typescript-definitions";
import { selectIsAdmin, useUserStore } from "store/user";
import { getAdminOrganisations, submitFeedback } from "../../../utils/api";
import { ErrorText } from "../../RulesModule/styles";
import { captureException, getErrorMessage } from "../../../utils/errorUtils";

interface IProps {
  show: boolean;
  data: {
    sessionKey: string;
    customerId: string;
    transactionId: string;
  };
  handleClose: () => void;
  handleSuccess: (feedback: Feedback) => void;
}

type FormValues = {
  organisation?: string;
  scope: string;
  status: string;
  type: string;
  reason: string;
};

const SCOPE_OPTIONS = [
  {
    value: "session",
    label: "Session",
  },
  {
    value: "user",
    label: "User",
  },
] as const;

const STATUS_OPTIONS = [
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "declined",
    label: "Declined",
  },
] as const;

const STATUS_FOR_SETTLEMENT_TYPE_OPTIONS = [
  {
    value: "settled",
    label: "Settled",
  },
  {
    value: "chargeback_fraud",
    label: "Chargeback Fraud",
  },
  {
    value: "chargeback_dispute",
    label: "Chargeback Dispute",
  },
] as const;

const TYPE_OPTIONS = [
  {
    value: "login",
    label: "Login",
  },
  {
    value: "onboarding",
    label: "Onboarding",
  },
  {
    value: "payment",
    label: "Payment",
  },
  {
    value: "settlement",
    label: "Settlement",
  },
  {
    value: "offboarding",
    label: "Offboarding",
  },
  {
    value: "update_profile",
    label: "Update profile",
  },
] as const;

const FeedbackPopUp: FC<IProps> = ({ handleClose, show, data, handleSuccess }) => {
  const isAdmin = useUserStore(selectIsAdmin);
  const [organisations, setOrganisations] = useState<OrgAdminList>([]);
  const [apiError, setApiError] = useState("");
  const {
    watch,
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({ mode: "onChange" });
  const type = watch("type");
  const onSubmit = handleSubmit(async ({ scope, status, type, reason, organisation }) => {
    try {
      await submitFeedback(
        {
          sessionKey: data.sessionKey,
          customer: {
            id: data.customerId,
          },
          transaction: {
            id: data.transactionId,
          },
          feedback: {
            scope,
            status,
            type,
            reason,
          },
        },
        organisation
      );
      handleSuccess({ reason, scope: scope.toUpperCase(), status, type, time: new Date().getTime() });
    } catch (e) {
      captureException(e);
      setApiError(getErrorMessage(e));
    }
  });

  useEffect(() => {
    async function loadOrganisations() {
      setOrganisations(await getAdminOrganisations());
    }

    if (isAdmin) {
      loadOrganisations()
        .then()
        .catch((e) => captureException(e));
    }
  }, [isAdmin]);

  return (
    <Modal id="action_model" show={show} onHide={handleClose} size="lg" centered>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          {isAdmin ? (
            <Form.Group className="mb-2">
              <Form.Label>Organisation</Form.Label>
              <Form.Select {...register("organisation")}>
                {organisations.map((organisation) => (
                  <option key={`feedback-pop-up-organisation-${organisation.clientID}`} value={organisation.name}>
                    {organisation.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          ) : null}
          <Form.Group className="mb-2">
            <Form.Label>Scope</Form.Label>
            <Form.Select {...register("scope")}>
              {SCOPE_OPTIONS.map((option) => (
                <option key={`feedback-pop-up-scope-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Type</Form.Label>
            <Form.Select {...register("type")}>
              {TYPE_OPTIONS.map((option) => (
                <option key={`feedback-pop-up-type-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Status</Form.Label>
            <Form.Select {...register("status")}>
              {(type === "settlement" ? STATUS_FOR_SETTLEMENT_TYPE_OPTIONS : STATUS_OPTIONS).map((option) => (
                <option key={`feedback-pop-up-status-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Reason</Form.Label>
            <Form.Control type="text" placeholder="" {...register("reason", { required: true })} />
          </Form.Group>
          {apiError && <ErrorText style={{ textTransform: "capitalize" }}>{apiError}</ErrorText>}
          <div style={{ justifyContent: "flex-end", display: "flex" }}>
            <Button
              style={{
                backgroundColor: "lightgrey",
                marginRight: 10,
                width: 80,
                borderWidth: 0,
              }}
              type="button"
              onClick={handleClose}
            >
              Dismiss
            </Button>
            <Button style={{ width: 80 }} type="submit" disabled={!isValid}>
              {isSubmitting ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                <span>Submit</span>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FeedbackPopUp;
