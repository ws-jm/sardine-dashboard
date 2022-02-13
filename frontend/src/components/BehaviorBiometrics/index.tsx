import React, { useState } from "react";
import { makeStyles, Step, StepConnector, StepLabel, Stepper, Tooltip } from "@material-ui/core";
// eslint-disable-next-line import/no-extraneous-dependencies
import { withStyles } from "@material-ui/styles";
import clsx from "clsx";
import { Card, Col, Container, Row, Tooltip as TooltipBT, OverlayTrigger } from "react-bootstrap";
import { BehaviorBiometricsPerFlow, BiometricField, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { StyledCard, StyledCardBody, BorderHide } from "../Customers/styles";
import biometricsIcon from "../../utils/logo/biometrics.svg";

export interface BehaviorBiometricsProps {
  behavior_biometrics: Array<BehaviorBiometricsPerFlow>;
}

// Stepper customizations
const QontoConnector = withStyles({
  line: {
    borderColor: "#784af4",
    borderTopWidth: 2,
    borderRadius: 1,
  },
})(StepConnector);

const BehaviorBiometrics = (props: BehaviorBiometricsProps) => {
  const behaviorBiometrics = props.behavior_biometrics
    .sort((bb) => bb.created_at)
    .map((bb) => Object.assign(bb, { flow: bb.flow || "-" }));
  const stepToFlow = behaviorBiometrics.reduce((acc: { [key: string]: number }, bb, idx: number) => {
    acc[bb.flow] = idx;
    return acc;
  }, {});
  const [inFocusFlow, setInFocusFlow] = useState(behaviorBiometrics.length > 0 ? behaviorBiometrics[0]?.flow : "");

  const renderStepper = () => {
    if (behaviorBiometrics.length > 1) {
      return (
        <Row style={{ marginBottom: 15 }} id="biometrics_steps">
          <Stepper alternativeLabel orientation="vertical" activeStep={stepToFlow[inFocusFlow]} connector={<QontoConnector />}>
            {behaviorBiometrics.map((bb) => (
              <Step id={bb.flow} key={bb.flow} onClick={() => setInFocusFlow(bb.flow)}>
                <Tooltip title={bb.flow} placement="top">
                  <StepLabel StepIconComponent={QontoStepIcon}>{bb.flow}</StepLabel>
                </Tooltip>
              </Step>
            ))}
          </Stepper>
        </Row>
      );
    }
  };

  const renderNoBiometricsDetailsFound = () => {
    if (behaviorBiometrics.length === 0) {
      return (
        <div className="text-center" id="no_biometrics_message">
          <h4>No Behavior Biometrics details found.</h4>
        </div>
      );
    }
  };

  return (
    <StyledCard style={{ marginTop: 15 }}>
      <Card.Header id="biometrics_title" style={{ color: "var(--dark-14)" }}>
        <img src={biometricsIcon} />
        <span>Behavior Biometrics</span>
      </Card.Header>
      <StyledCardBody>
        {renderNoBiometricsDetailsFound()}
        {renderStepper()}
        {behaviorBiometrics
          .filter((bb) => bb.flow === inFocusFlow)
          .map((bb) => (
            <BehaviorBiometric {...bb} key={bb.created_at} />
          ))}
        <BorderHide />
      </StyledCardBody>
    </StyledCard>
  );
};

const renderFields = (fields: Array<BiometricField>) => {
  if (fields.length > 0) {
    return (
      <>
        {fields.map((f) => (
          <span key={f.name}>
            <BiometricFieldComponent {...f} />
            <hr />
          </span>
        ))}
      </>
    );
  }
  return (
    <Row>
      <Col className="text-center">No Input Fields Found</Col>
    </Row>
  );
};

const Attribute: React.FC<{ property: string; value: AnyTodo; description?: string }> = (props) => {
  const { property, value, description } = props;

  if (property !== "Flow") {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <OverlayTrigger placement="top" overlay={<TooltipBT id={`tooltip-${property}`}> {description || ""} </TooltipBT>}>
            <p
              style={{
                fontSize: 14,
                textTransform: "capitalize",
                fontWeight: "normal",
                margin: 0,
              }}
              id={`${property}_title`}
            >
              {property}:
            </p>
          </OverlayTrigger>
        </div>
        <div id={`${property}_value`}>{String(value)} </div>
      </div>
    );
  } else {
    return (
      <Row>
        <p style={{ fontSize: 20, fontWeight: "semibold" }}>{String(value)} </p>
      </Row>
    );
  }
};

const BehaviorBiometric: React.FC<BehaviorBiometricsPerFlow> = (props) => {
  const { fields, flow, num_context_switch_events, num_distraction_events } = props;
  return (
    <Container>
      <Row>
        <Col xs={12} lg={6} style={{ padding: "0 20px" }}>
          <Attribute property="Flow" value={flow} description="Flow provided by you" />
          <Attribute
            property="Num Distraction Events"
            value={num_distraction_events}
            description="No of times user switched between tabs/windows"
          />
          <Attribute
            property="Num Context Switch Events"
            value={num_context_switch_events}
            description="No of context switches"
          />
        </Col>
        <Col xs={12} lg={6} style={{ padding: "0 20px" }}>
          <Row className="text-center">
            <p id="input_field_title" style={{ fontSize: 20, fontWeight: "semibold" }}>
              Input Fields
            </p>
          </Row>
          {renderFields(fields)}
        </Col>
      </Row>
    </Container>
  );
};

const BiometricFieldComponent: React.FC<BiometricField> = (props) => {
  const {
    hesitation_percentage,
    is_ltm,
    name,
    num_auto_fill_events,
    num_clipboard_events,
    num_copy_paste_events,
    num_expert_key_events,
  } = props;
  return (
    <>
      <Attribute property="Name" value={name} description="Input field name" />
      <Attribute property="Num Copy Paste Events" value={num_copy_paste_events} description="Copy paste by keyboard shortcuts" />
      <Attribute property="Num Clipboard Events" value={num_clipboard_events} description="Copy paste by mouse" />
      <Attribute property="Num Auto Fill Events" value={num_auto_fill_events} description="Num of autofill events" />
      <Attribute
        property="Num Expert Key Events"
        value={num_expert_key_events}
        description="If special keys are used while filling this field"
      />
      <Attribute
        property="Hesitation Percentage"
        value={hesitation_percentage}
        description="Calculated based on backspaces and timespent while filling this field"
      />
      <Attribute property="Is Ltm" value={is_ltm} description="PII field" />
    </>
  );
};

const useQontoStepIconStyles = makeStyles({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: "#784af4",
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18,
  },
});

const QontoStepIcon = (props: { active: AnyTodo; completed: AnyTodo }) => {
  const classes = useQontoStepIconStyles();
  const { active } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      <div className={classes.circle} />
    </div>
  );
};

export default BehaviorBiometrics;
