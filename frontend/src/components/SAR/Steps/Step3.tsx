import React from "react";
import { Container, Row, Col, Form, FloatingLabel, Button, Alert, InputGroup, FormControl, Card } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import CheckBoxGroup from "../Components/CheckBoxGroup";
import InputField from "../Components/InputField";
import ManageOptionPopup from "../Components/ManageOptionPopup";

const Step3 = () => {
  const [modalShow, setModalShow] = React.useState(false);

  return (
    <Container fluid="lg" className="pt-8 pb-6">
      <Row>
        <Col xs={12}>
          <Row className="bb align-items-center">
            <Col xs={12} md={8}>
              <h1 className="pageTitle">Part III Information about Financial Institution Where Activity Occurred</h1>
            </Col>
            <Col xs={12} md={4} className="text-end">
              <Button onClick={() => setModalShow(true)} variant="primary">
                <MdAdd className="ic icBack" /> Add Financial Institution
              </Button>
              <ManageOptionPopup show={modalShow} onHide={() => setModalShow(false)} />
            </Col>
          </Row>
          <Card className="bg-secondary">
            <Card.Header as="h4">
              <Row className="align-items-center">
                <Col xs={12} md={7}>
                  Financial Institution lists
                </Col>
                <Col xs={12} md={5} className="text-end">
                  <Button onClick={() => setModalShow(true)} variant="outline-primary">
                    Edit Financial Institution
                  </Button>{" "}
                  <Button onClick={() => setModalShow(true)} variant="outline-danger">
                    Delete Financial Institution
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className="pt-1 pb-1">
                <Col xs={12} className="mb-2">
                  <Form.Check label="Financial Institution Name 1" name="group1" type="radio" />
                </Col>
                <Col xs={12}>
                  <Form.Check label="Financial Institution Name 2" name="group1" type="radio" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <Alert variant="warning">
            <Row className="align-items-center">
              <Col lg={8}>
                <p className="mb-0">Would you like to insert all applicable filing institution information into Part III?</p>
              </Col>
              <Col lg={4} className="text-end">
                <Button variant="outline-primary">Yes</Button>
              </Col>
            </Row>
          </Alert>
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
                        51 Type of financial institution
                        <span className="mandatory">*</span>
                      </>
                    }
                    label="Other"
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
                    52 primary federal regulator
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
                    title="53 Type of gaming institution"
                    numberOfColumns={3}
                    values={["State licensed casino", "Tribal authorized casino", "Card club"]}
                  />
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6} md={4}>
                      <FloatingLabel controlId="floatingInput" label="Other (specify)">
                        <Form.Control type="text" placeholder="Other (specify)" />
                      </FloatingLabel>
                    </Col>
                  </Row>
                </Col>
                <Col xs={12} className="mb-32px">
                  <CheckBoxGroup
                    title="54 Type of Securities and Futures institution or individual where activity occurred - check box(es) that apply to this report"
                    numberOfColumns={3}
                    values={[
                      "Clearing broker-securities",
                      "Introducing broker-securities",
                      "Subsidiary of financial/bank holding company",
                      "Execution-only broker securities",
                      "Investment Adviser",
                      "Futures Commission Merchant",
                      "Investment company",
                      "Holding company",
                      "Retail foreign exchange dealer",
                      "Introducing broker-commodities",
                      "Self-clearing broker securities",
                    ]}
                  />
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6} md={4}>
                      <FloatingLabel controlId="floatingInput" label="Other (specify)">
                        <Form.Control type="text" placeholder="Other (specify)" />
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
                        <option>Open this select menu</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                      </Form.Select>
                    }
                  />
                </Col>
                <Col xs={12} className="mb-32px">
                  <CheckBoxGroup
                    title={"56 Financial institution's role in transaction"}
                    numberOfColumns={3}
                    values={["Selling location", "Paying location", "Both"]}
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>
                    57 Legal name of financial institution
                    <span className="mandatory">*</span>
                  </Form.Label>
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6} md={4}>
                      <Form.Check label="Unknown" name="group1" />
                    </Col>
                  </Row>
                  <Row className="pt-1 pb-1">
                    <Col xs={12}>
                      <FloatingLabel controlId="floatingInput" label="Location">
                        <Form.Control type="text" placeholder="Location" />
                      </FloatingLabel>
                    </Col>
                  </Row>
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField
                    title={
                      <>
                        {"58 Alternate Name, "}
                        <small>e.g., AKA - individual or trade name, DBA - entity</small>
                      </>
                    }
                    label="Enter alternate name here"
                    childBefore={<Row className="pt-2 pb-2" />}
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>
                    59 TIN
                    <span className="mandatory">*</span>
                  </Form.Label>
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6} md={4}>
                      <Form.Check label="Unknown" name="group1" />
                    </Col>
                  </Row>
                  <Row className="pt-1 pb-1">
                    <Col xs={12}>
                      <FloatingLabel controlId="floatingInput" label="Location">
                        <Form.Control type="text" placeholder="Location" />
                      </FloatingLabel>
                    </Col>
                  </Row>
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label className="pt-4 pb-3">60 TIN type</Form.Label>
                  <Form.Select aria-label="Default select example">
                    <option>Type</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>
                    61 Address
                    <span className="mandatory">*</span>
                  </Form.Label>
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6} md={4}>
                      <Form.Check label="Unknown" name="group1" />
                    </Col>
                  </Row>
                  <FloatingLabel controlId="floatingInput" label="Address">
                    <Form.Control type="text" placeholder="Address" />
                  </FloatingLabel>
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>
                    62 City
                    <span className="mandatory">*</span>
                  </Form.Label>
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6} md={4}>
                      <Form.Check label="Unknown" name="group1" />
                    </Col>
                  </Row>
                  <FloatingLabel controlId="floatingInput" label="City">
                    <Form.Control type="text" placeholder="City" />
                  </FloatingLabel>
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>63 State</Form.Label>
                  <Form.Select aria-label="Default select example">
                    <option>Type</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>
                    64 ZIP/Postal Code
                    <span className="mandatory">*</span>
                  </Form.Label>
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6} md={4}>
                      <Form.Check label="Unknown" name="group1" />
                    </Col>
                  </Row>
                  <FloatingLabel controlId="floatingInput" label="ZIP/Postal">
                    <Form.Control type="text" placeholder="ZIP/Postal" />
                  </FloatingLabel>
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>
                    65 Country
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
                  <InputField title="66 Internal control/file number" label="control/file number" />
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>67 Loss to financial institution</Form.Label>
                  <Form.Label htmlFor="inlineFormInputGroup" visuallyHidden>
                    Amount
                  </Form.Label>
                  <InputGroup className="mb-2">
                    <InputGroup.Text>$</InputGroup.Text>
                    <FormControl id="inlineFormInputGroup" placeholder="Amount" />
                    <InputGroup.Text>.00</InputGroup.Text>
                  </InputGroup>
                </Col>
              </Form.Group>
              <Row>
                <Col xs={12}>
                  <Card className="bg-secondary">
                    <Card.Header as="h5">Branch where activity occurred information</Card.Header>
                    <Card.Body>
                      <Row className="pt-1 pb-5">
                        <Col xs={12} sm={6} md={4}>
                          <Form.Check label="If no branch activity involved, check this box" name="group1" />
                        </Col>
                      </Row>
                      <Row className="mb-4 bb align-items-center">
                        <Col xs={12} md={10}>
                          <Card.Title as="h6">Branch Information</Card.Title>
                        </Col>
                        <Col xs={12} md={2}>
                          <Row className="text-end align-items-center">
                            <Col xs={6}>1{" of "}1</Col>
                            <Col xs={6}>
                              <Button variant="outline-primary">+</Button>{" "}
                              {/* <Button variant="outline-danger">{"-"}</Button>{" "} */}
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Form.Group as={Row}>
                        <Col xs={12} className="mb-32px">
                          <CheckBoxGroup
                            title={"68 Branch's role in transaction"}
                            numberOfColumns={3}
                            values={["Selling location", "Paying location", "Both"]}
                          />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField title="69 Address of branch or office where activity occurred" label="Enter address here" />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField title="71 City" label="Enter city here" />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField title="70 RSSD Number" label="Enter RSSD here" />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <Form.Label>72 State</Form.Label>
                          <Form.Select aria-label="Default select example">
                            <option>Type</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                          </Form.Select>
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField title="73 ZIP/Postal Code" label="Enter ZIP/Postal Code here" />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <Form.Label>
                            74 Country
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select aria-label="Default select example">
                            <option>Type</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                          </Form.Select>
                        </Col>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Step3;
