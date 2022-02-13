import React from "react";
import { Container, Row, Col, Form, FloatingLabel, Card } from "react-bootstrap";
import CheckBoxGroup from "../Components/CheckBoxGroup";
import InputField from "../Components/InputField";

const Step2 = () => (
  <Container fluid="lg" className="pt-8 pb-6">
    <Row>
      <Col xs={12}>
        <Row className="bb align-items-center">
          <Col xs={12} md={8}>
            <h1 className="pageTitle">Part IV Filing Institution Contact Information</h1>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row className="pb-5">
      <Col xs={12}>
        <Form>
          <Card className="formCard">
            <Form.Group as={Row}>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      79 Type of financial institution
                      <span className="mandatory">*</span>
                    </>
                  }
                  label="Enter TIN here"
                  childBefore={
                    <Form.Select aria-label="Default select example" className="mb-2">
                      <option>Open this select menu</option>
                      <option value="1">One</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                    </Form.Select>
                  }
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <Form.Label>
                  75 Primary federal regulator
                  <span className="mandatory">*</span>
                </Form.Label>
                <Form.Select aria-label="Default select example">
                  <option>Open this select menu</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </Form.Select>
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      76 Filer name
                      <span className="mandatory">*</span>
                      <small>(Holding company, lead financial institution, or agency, if applicable)</small>
                    </>
                  }
                  label="Enter filer name here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      77 TIN
                      <span className="mandatory">*</span>
                    </>
                  }
                  label="Enter TIN here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <Form.Label>
                  78 TIN type
                  <span className="mandatory">*</span>
                </Form.Label>
                <Form.Select aria-label="Default select example">
                  <option>Open this select menu</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </Form.Select>
              </Col>
              <Col xs={12} className="mb-32px">
                <CheckBoxGroup
                  title="80 Type of Securities and Futures institution or individual filing this report - check box(es) for functions that apply to this report"
                  numberOfColumns={3}
                  values={[
                    "Clearing broker-securities",
                    "Introducing broker-securities",
                    "SRO Securities",
                    "CPO/CTA",
                    "Investment Adviser",
                    "Subsidiary of financial/bank holding company",
                    "Execution-only broker securities",
                    "Investment company",
                    "Futures Commission Merchant",
                    "Retail foreign exchange dealer",
                    "Holding company",
                    "Self-clearing broker securities",
                    "Introducing broker-commodities",
                    "SRO Futures",
                  ]}
                />
                <Row className="pt-1 pb-1">
                  <Col xs={12} sm={6} md={4}>
                    <FloatingLabel controlId="floatingInput" label="Other">
                      <Form.Control type="text" placeholder="Other" />
                    </FloatingLabel>
                  </Col>
                </Row>
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title="81 Financial institution identification"
                  label="Number"
                  childBefore={
                    <Form.Select aria-label="Default select example" className="mb-2">
                      <option>Type</option>
                      <option value="1">One</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                    </Form.Select>
                  }
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      82 Address
                      <span className="mandatory">*</span>
                    </>
                  }
                  label="Enter your address here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      82 City
                      <span className="mandatory">*</span>
                    </>
                  }
                  label="Enter your city here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <Form.Label>
                  84 State
                  <span className="mandatory">*</span>
                </Form.Label>
                <Form.Select aria-label="Default select example">
                  <option>Type</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </Form.Select>
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      85 ZIP/Postal Code
                      <span className="mandatory">*</span>
                    </>
                  }
                  label="Enter your ZIP/Postal code here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <Form.Label>86 Country</Form.Label>
                <Form.Select aria-label="Default select example">
                  <option>Type</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </Form.Select>
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      {"87 Alternate name, "}
                      <small>e.g., AKA - individual or trade name, DBA - entity</small>
                    </>
                  }
                  label="Enter alternate name here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField title="88 Internal control/file number" label="Enter control/file number here" />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField title="89 LE contact agency" label="Enter LE contact agency here" />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField title="90 LE contact name" label="Enter LE contact name here" />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      {"91 LE contact phone number "}
                      <small>(Include Area Code)</small>
                    </>
                  }
                  label="Enter your input here"
                  childAfter={
                    <Col sm={3}>
                      <FloatingLabel controlId="floatingInput" label="Ext.">
                        <Form.Control type="text" placeholder="Ext." />
                      </FloatingLabel>
                    </Col>
                  }
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField title="92 LE contact date" label="Enter LE contact date here" />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      93 Filing institution contact office
                      <span className="mandatory">*</span>
                    </>
                  }
                  label="Enter your input here"
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      94 Filing institution contact phone number
                      <span className="mandatory">*</span>
                      <small>(Include Area Code)</small>
                    </>
                  }
                  label="Enter your input here"
                  childAfter={
                    <Col sm={3}>
                      <FloatingLabel controlId="floatingInput" label="Ext.">
                        <Form.Control type="text" placeholder="Ext." />
                      </FloatingLabel>
                    </Col>
                  }
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      {"95 Date filed "}
                      <small>(Date filed will be auto-populated when the form is signed.)</small>
                    </>
                  }
                  label="Current date"
                />
              </Col>
            </Form.Group>
          </Card>
        </Form>
      </Col>
    </Row>
  </Container>
);

export default Step2;
