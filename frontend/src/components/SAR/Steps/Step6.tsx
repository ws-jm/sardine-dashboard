import React from "react";
import { Container, Row, Col, Form, FloatingLabel, Card, Button, Alert } from "react-bootstrap";

const Step6 = () => (
  <Container fluid="lg" className="pt-8 pb-6">
    <Row>
      <Col xs={12}>
        <Row className="bb align-items-center">
          <Col xs={12} md={8}>
            <h1 className="pageTitle">
              Part V Suspicious Activity Information - Narrative
              <span className="mandatory">*</span>
            </h1>
          </Col>
        </Row>
      </Col>
      <Col xs={12}>
        <Form>
          <Card className="formCard">
            <Form.Group as={Row}>
              <Col xs={12}>
                <FloatingLabel controlId="floatingTextarea2" label="Leave a comment here">
                  <Form.Control as="textarea" placeholder="Leave a comment here" style={{ height: "600px" }} />
                </FloatingLabel>
              </Col>
            </Form.Group>
          </Card>
          <Alert variant="warning">
            <Row className="align-items-center">
              <Col lg={8}>
                <Form.Label>
                  Enter PIN
                  <span className="mandatory">*</span>
                </Form.Label>
                <Form.Control
                  as="input"
                  placeholder="Enter pin here"
                  style={{ backgroundColor: "transparent", border: "none" }}
                />
              </Col>
              <Col lg={4} className="text-end">
                <Button size="lg" variant="primary">
                  Sign with PIN
                </Button>
              </Col>
            </Row>
          </Alert>
        </Form>
      </Col>
    </Row>
  </Container>
);

export default Step6;
