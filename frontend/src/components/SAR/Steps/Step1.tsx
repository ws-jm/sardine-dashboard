import React from "react";
import ReactDOMServer from "react-dom/server";
import { Container, Row, Col, Card, ListGroup, Form, Button, Alert } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import CheckBoxGroup from "../Components/CheckBoxGroup";
import InputField from "../Components/InputField";

const INSTRUCTIONS = [
  <>Complete the report in its entirety with all required and known requested data provided.</>,
  <>
    Select <strong>Submit</strong> to file the report.
  </>,
  <>
    If you find any error while submitting, then select <strong>Validate</strong> to ensure the report has no errors.
  </>,
  <>
    Select <strong>Submit</strong> to resubmit the report.
  </>,
] as const;

const Step1 = (): JSX.Element => (
  <Container fluid="lg" className="pt-8 pb-6">
    <Row>
      <Col xs={12}>
        <Row className="bb align-items-center">
          <Col xs={12} md={8}>
            <h1 className="pageTitle">Suspicious Activity Report</h1>
          </Col>
        </Row>
        <Alert variant="warning">
          <Row className="align-items-center">
            <Col lg={8}>
              <p className="mb-0">
                <strong>OMB No.</strong>
                1506-0065 (Report)
              </p>
              <p className="mb-0">
                <strong>OMB No.</strong>
                1506-0001, 1506-0006, 1506-0015, 1506-0019, 1506-0029, and 1506-0061 (Regulations)
              </p>
            </Col>
            <Col lg={4}>
              <p className="text-end mb-0 version">Version Number: 1.2</p>
            </Col>
          </Row>
        </Alert>
      </Col>
      <Col xs={12}>
        <Card className="bg-secondary">
          <Card.Header as="h4">How to File</Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              {INSTRUCTIONS.map((value, index) => (
                <ListGroup.Item className="bg-transparent" key={ReactDOMServer.renderToString(value)}>
                  <span>{`${index + 1}.`}</span>
                  {value}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12}>
        <Form>
          <Card className="formCard">
            <Form.Group as={Row}>
              <Col sm={6} className="mb-32px">
                <InputField title="Filing name" label="Enter your filing name here" />
              </Col>
              <Col sm={6} className="mb-32px">
                <CheckBoxGroup
                  title={
                    <>
                      1 Type of filing
                      <span className="mandatory">*</span>
                      <small>(Check all that apply)</small>
                    </>
                  }
                  numberOfColumns={2}
                  values={["Initial report", "Correct/Amend prior report", "Continuing activity report", "Joint report"]}
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      {"Prior report BSA Identification Number "}
                      <small>(BSA ID)</small>
                    </>
                  }
                  label="Enter your BSA ID here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField title="2 Filing Institution Note to FinCEN" label="Enter your note here" />
              </Col>
              <Col sm={6} className="mb-32px">
                <Form.Label>Attachment</Form.Label>
                <Row className="justify-content-md-center">
                  <Col xs={10}>
                    <Form.Control type="file" className="h-auto" />
                    <Col xs={12} className="mt-2">
                      File-name.pdf
                      <Button variant="link">View</Button>
                      <Button variant="link">Save</Button>
                      <Button variant="link" className="danger">
                        Delete
                      </Button>
                    </Col>
                    <Col xs={12} className="mt-2">
                      File-name.pdf
                      <Button variant="link">View</Button>
                      <Button variant="link">Save</Button>
                      <Button variant="link" className="danger">
                        Delete
                      </Button>
                    </Col>
                  </Col>
                  <Col xs={2} className="text-end">
                    <Button variant="primary" className="btnAdd">
                      <MdAdd />
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Form.Group>
          </Card>
        </Form>
      </Col>
    </Row>
  </Container>
);

export default Step1;
