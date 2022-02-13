import React, { useState, useEffect } from "react";
import { Button, Form, FloatingLabel } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import { OrganizationUser, Queue } from "sardine-dashboard-typescript-definitions";
import { isEmailValid, isUrlValid } from "components/Common/Functions";
import { DATA_TYPES, DROPDOWN_TYPES, isWideScreen } from "../../../utils/dataProviderUtils";
import { BackgroundBox, StyledSubHeading, Container, TextNormal, StyledUl, HorizontalSpace, Line } from "../styles";
import RecursiveDropdown from "../../Common/RecursiveDropdown";
import CustomInput from "./CustomInput";

interface ResponseProps {
  name: string;
  owner_id: string;
  id: string;
}

interface JiraProps {
  email: string;
  token: string;
  url: string;
}

interface QueueProps {
  queue?: Queue;
  user?: OrganizationUser;
  queues: Queue[];
  users: OrganizationUser[];
  jiraData?: JiraProps;
  jiraEnabled: boolean;
  onQueueSelected: (data: ResponseProps, user?: OrganizationUser) => void;
  onJiraitemsChange: (data: JiraProps) => void;
}

interface ContainerProps {
  type: string;
}

const QueueSection = (p: QueueProps) => {
  const [visibleDropDown, setVisibleDropDown] = useState("");
  const [queue, setQueue] = useState<Queue | undefined>(p.queue);
  const [assignedTo, setAssignedTo] = useState<OrganizationUser | undefined>(p.user);
  const [isAddQueue, setIsAddQueue] = useState(false);
  const [enableJira, setEnableJira] = useState(p.jiraEnabled);
  const [jiraEmail, setJiraEmail] = useState(p.jiraEnabled ? p.jiraData?.email || "" : "");
  const [jiraToken, setJiraToken] = useState(p.jiraEnabled ? p.jiraData?.token || "" : "");
  const [jiraURL, setJiraURL] = useState(p.jiraEnabled ? p.jiraData?.url || "" : "");
  const { addToast } = useToasts();

  const jiraFields = ["Email", "Jira API Token", "Jira URL"];

  useEffect(() => {
    p.onJiraitemsChange({
      email: jiraEmail,
      token: jiraToken,
      url: jiraURL,
    });
  }, [jiraEmail, jiraToken, jiraURL]);

  useEffect(() => {
    if (enableJira) {
      const data = p.jiraData;
      setJiraEmail(data?.email || "");
      setJiraToken(data?.token || "");
      setJiraURL(data?.url || "");
    } else {
      setJiraEmail("");
      setJiraToken("");
      setJiraURL("");
    }
  }, [enableJira]);

  useEffect(() => {
    const customQueue = {
      name: queue?.name || "",
      owner_id: assignedTo?.id || "",
      id: queue?.id || "",
    };
    p.onQueueSelected(customQueue, assignedTo);
  }, [queue, assignedTo]);

  const isValidValue = (index: number) => {
    switch (index) {
      case 0:
        return isEmailValid(jiraEmail);
      case 2:
        return isUrlValid(jiraURL);
      default:
        return true;
    }
  };

  const DropDownContainer = (props: ContainerProps) => {
    const isQueue = props.type === DROPDOWN_TYPES.Queue;
    return (
      <Container className={`queue-dropdown-${props.type}`} id={`queue_dropdown_${props.type}`} style={{ padding: "0px 20px" }}>
        <StyledSubHeading style={{ textTransform: "capitalize", fontWeight: 500 }}>{props.type}</StyledSubHeading>
        <RecursiveDropdown
          show={visibleDropDown === props.type}
          onDropdownClicked={(show) => {
            setVisibleDropDown(show ? "" : props.type);
          }}
          onItemClicked={(val, _) => {
            if (isQueue) {
              const _queue = p.queues.filter((q) => q.name === val);
              if (_queue.length > 0) {
                const q = _queue[0];
                setQueue(q);
                if (!assignedTo) {
                  const _user = p.users.filter((u) => u.id === q.owner_id);
                  if (_user.length > 0) {
                    setAssignedTo(_user[0]);
                  }
                }
              }
            } else {
              const _user = p.users.filter((u) => u.name === val);
              if (_user.length > 0) {
                setAssignedTo(_user[0]);
              }
            }
            setVisibleDropDown("");
          }}
          value={isQueue ? queue?.name || "" : assignedTo?.name || ""}
          data={
            isQueue
              ? p.queues
                  .map((q) => ({
                    title: q.name,
                    items: [],
                    datatype: DATA_TYPES.string,
                  }))
                  .filter((i) => i.title.length > 0)
              : p.users
                  .map((u) => ({
                    title: u.name,
                    items: [],
                    datatype: DATA_TYPES.string,
                  }))
                  .filter((i) => i.title.length > 0)
          }
        />
      </Container>
    );
  };

  return (
    <BackgroundBox
      style={{
        border: "1px solid rgba(0, 0, 0, 0.1)",
        marginTop: 20,
        marginBottom: 20,
        maxWidth: isWideScreen() ? "80%" : "100%",
        minWidth: "60%",
        boxShadow: "none",
      }}
    >
      <StyledSubHeading style={{ margin: 20, color: "#001932", fontWeight: 600 }}>Case Management</StyledSubHeading>

      <StyledUl style={{ marginTop: 10, justifyContent: "flex-start" }}>
        <DropDownContainer type={DROPDOWN_TYPES.Queue} />
        <Container style={{ marginLeft: isWideScreen() ? 10 : 0 }}>
          <DropDownContainer type={DROPDOWN_TYPES.QueueUser} />
        </Container>
      </StyledUl>
      <Container style={{ padding: "10px 20px", maxWidth: isWideScreen() ? "50%" : "100%" }}>
        {isAddQueue ? (
          <CustomInput
            allowSpace
            onCancelClick={() => setIsAddQueue(false)}
            onSubmitClick={(value) => {
              if (p.queues.map((q) => q.name.toLowerCase()).includes(value.toLowerCase())) {
                addToast(`Queue ${value} is already available!`, {
                  appearance: "error",
                  autoDismiss: true,
                });
                return;
              }

              const customQueue = {
                name: value,
                owner_id: assignedTo ? assignedTo.id : "",
                id: "",
              };
              setQueue(customQueue);
              setIsAddQueue(false);
            }}
          />
        ) : (
          <Button
            className="button-add-new-queue"
            id="button_add_new_queue"
            style={{
              backgroundColor: "#F8FBFF",
              border: "none",
              height: 35,
              marginBottom: 10,
            }}
            onClick={() => setIsAddQueue(true)}
          >
            <TextNormal style={{ color: "#2173FF", fontWeight: "bold" }}>+ Add new queue</TextNormal>
          </Button>
        )}
      </Container>
      <Line />
      <Form.Check
        className="queue-check-jira-tickets"
        id="queue_check_jira_tickets"
        label={<StyledSubHeading style={{ fontWeight: 500, margin: 0 }}>Enable Jira tickets?</StyledSubHeading>}
        name="check-cm"
        checked={enableJira}
        style={{ marginLeft: 15 }}
        onClick={() => setEnableJira(!enableJira)}
      />
      {enableJira ? (
        <Container style={{ padding: 20 }}>
          <Container style={{ width: isWideScreen() ? "50%" : "100%" }}>
            {jiraFields.map((title, index) => (
              <FloatingLabel controlId="floatingInput" label={title} className="mb-2" key={title}>
                <Form.Control
                  className="queue-jira-ticket"
                  id="queue_jira_ticket"
                  type={index === 0 ? "email" : index === 1 ? "text" : "url"}
                  placeholder={title}
                  value={index === 0 ? jiraEmail : index === 1 ? jiraToken : jiraURL}
                  isInvalid={!isValidValue(index)}
                  onChange={(event) => {
                    const val = event.target.value;

                    switch (index) {
                      case 0:
                        return setJiraEmail(val);
                      case 1:
                        return setJiraToken(val);
                      case 2:
                        return setJiraURL(val);
                      default:
                    }
                  }}
                />
              </FloatingLabel>
            ))}
          </Container>
          <StyledSubHeading>
            Please refer this{" "}
            <a
              href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#325078" }}
            >
              LINK
            </a>{" "}
            to get an API token.
          </StyledSubHeading>
        </Container>
      ) : (
        <HorizontalSpace />
      )}
    </BackgroundBox>
  );
};

export default QueueSection;
