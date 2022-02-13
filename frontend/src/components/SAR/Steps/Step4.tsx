import React from "react";
import { Container, Row, Col, Form, FloatingLabel, Button, Card } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import CheckBoxGroup from "../Components/CheckBoxGroup";
import InputField from "../Components/InputField";
import ManageOptionPopup from "../Components/ManageOptionPopup";

const Step4 = () => {
  const [modalShow, setModalShow] = React.useState(false);

  return (
    <Container fluid="lg" className="pt-8 pb-6">
      <Row>
        <Col xs={12}>
          <Row className="bb align-items-center">
            <Col xs={12} md={8}>
              <h1 className="pageTitle">Part I Subject Information</h1>
            </Col>
            <Col xs={12} md={4} className="text-end">
              <Button onClick={() => setModalShow(true)} variant="primary">
                <MdAdd className="ic icBack" /> Add Subject
              </Button>
              <ManageOptionPopup show={modalShow} isSubject onHide={() => setModalShow(false)} />
            </Col>
          </Row>
        </Col>
      </Row>
      <Card className="bg-secondary">
        <Card.Header as="h4">
          <Row className="align-items-center">
            <Col xs={12} md={8}>
              Subject lists
            </Col>
            <Col xs={12} md={4} className="text-end">
              <Button onClick={() => setModalShow(true)} variant="outline-primary">
                Edit Subject
              </Button>{" "}
              <Button onClick={() => setModalShow(true)} variant="outline-danger">
                Delete Subject
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="pt-1 pb-1">
            <Col xs={12} className="mb-2">
              <Form.Check label="Subject Name 1" name="group1" type="radio" />
            </Col>
            <Col xs={12}>
              <Form.Check label="Subject Name 2" name="group1" type="radio" />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row>
        <Col xs={12}>
          <Form>
            <Card className="formCard">
              <Form.Group as={Row}>
                <Col xs={12} className="mb-32px">
                  <Form.Label>3 Check</Form.Label>
                  <Row className="pt-1 pb-1">
                    <Col xs={12} sm={6}>
                      <Form.Check label="if entity," name="group1" />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Check
                        label={
                          <>
                            if all critical
                            <span className="mandatory">*</span>
                            subject information is unavailable (Does not include item 27)
                          </>
                        }
                        name="group2"
                      />
                    </Col>
                  </Row>
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField
                    title={
                      <>
                        4 Individual's last name or entity's legal name
                        <span className="mandatory">*</span>
                      </>
                    }
                    label="Enter Individual's last name or entity's legal name here"
                    childBefore={
                      <Row className="pt-1 pb-1">
                        <Col xs={12} sm={6} md={4}>
                          <Form.Check label="Unknown" name="group1" />
                        </Col>
                      </Row>
                    }
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField
                    title={
                      <>
                        5 First name
                        <span className="mandatory">*</span>
                      </>
                    }
                    label="Enter Individual's last name or entity's legal name here"
                    childBefore={
                      <Row className="pt-1 pb-1">
                        <Col xs={12} sm={6} md={4}>
                          <Form.Check label="Unknown" name="group1" />
                        </Col>
                      </Row>
                    }
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField title="6 Middle name/initial" label="Enter middle name here" />
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField title="7 Suffix" label="Suffix" />
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>8 Gender</Form.Label>
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
                        19 Date of birth
                        <span className="mandatory">*</span>
                      </>
                    }
                    label="Birth date"
                    childBefore={
                      <Row className="pt-1 pb-1">
                        <Col xs={12} sm={6} md={4}>
                          <Form.Check label="Unknown" name="group1" />
                        </Col>
                      </Row>
                    }
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField
                    title={
                      <>
                        {"9 Alternate name, "}
                        <small>AKA - individual or trade name, DBA - entity</small>
                      </>
                    }
                    label="Enter alternate name here"
                    hasAddMore
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField title="10 Occupation or type of business" label="Enter type of business here" />
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>10a NAICS Code</Form.Label>
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
                        16 TIN
                        <span className="mandatory">*</span>
                      </>
                    }
                    label="TIN"
                    childBefore={
                      <Row className="pt-1 pb-1">
                        <Col xs={12} sm={6} md={4}>
                          <Form.Check label="Unknown" name="group1" />
                        </Col>
                      </Row>
                    }
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>17 TIN type</Form.Label>
                  <Form.Select aria-label="Default select example">
                    <option>Type</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField
                    title="21 Phone number"
                    label="Enter phone number here"
                    hasAddMore
                    childAfter={
                      <>
                        <Col sm={2}>
                          <FloatingLabel controlId="floatingInput" label="Ext." className="mb-2">
                            <Form.Control type="text" placeholder="Ext." />
                          </FloatingLabel>
                        </Col>
                        <Col sm={3}>
                          <Form.Select aria-label="Default select example">
                            <option>Type</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                          </Form.Select>
                        </Col>
                      </>
                    }
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField title="22 E-mail address" label="Enter email address here" hasAddMore />
                </Col>
                <Col sm={6} className="mb-32px">
                  <InputField
                    title={
                      <>
                        22
                        <small>{" a"}</small>
                        {" Website "}
                        <small>(URL)</small> {" address"}
                      </>
                    }
                    label="URL"
                    hasAddMore
                  />
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>23 Corroborative statement to filer?</Form.Label>
                  <Form.Select aria-label="Default select example">
                    <option>Type</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                </Col>
                <Col sm={6} className="mb-32px">
                  <Form.Label>28 Subject's role in suspicious activity</Form.Label>
                  <Form.Select aria-label="Default select example">
                    <option>Type</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select>
                </Col>
              </Form.Group>
              <Row>
                <Col xs={12}>
                  <Card className="bg-secondary">
                    <Card.Header as="h5">Subject Address Information</Card.Header>
                    <Card.Body>
                      <Row className="mb-4 bb align-items-center">
                        <Col xs={12} md={10}>
                          <Card.Title as="h6">Information</Card.Title>
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
                        <Col sm={6} className="mb-32px">
                          <InputField
                            title={
                              <>
                                11 Address
                                <span className="mandatory">*</span>
                              </>
                            }
                            label="Address"
                            childBefore={
                              <Row className="pt-1 pb-1">
                                <Col xs={12} sm={6} md={4}>
                                  <Form.Check label="Unknown" name="group1" />
                                </Col>
                              </Row>
                            }
                          />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField
                            title={
                              <>
                                12 City
                                <span className="mandatory">*</span>
                              </>
                            }
                            label="City"
                            childBefore={
                              <Row className="pt-1 pb-1">
                                <Col xs={12} sm={6} md={4}>
                                  <Form.Check label="Unknown" name="group1" />
                                </Col>
                              </Row>
                            }
                          />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <Form.Label>
                            13 State
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Row className="pt-1 pb-1">
                            <Col xs={12} sm={6} md={4}>
                              <Form.Check label="Unknown" name="group1" />
                            </Col>
                          </Row>
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
                                14 ZIP/Postal Code
                                <span className="mandatory">*</span>
                              </>
                            }
                            label="ZIP"
                            childBefore={
                              <Row className="pt-1 pb-1">
                                <Col xs={12} sm={6} md={4}>
                                  <Form.Check label="Unknown" name="group1" />
                                </Col>
                              </Row>
                            }
                          />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <Form.Label>
                            15 Country
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Row className="pt-1 pb-1">
                            <Col xs={12} sm={6} md={4}>
                              <Form.Check label="Unknown" name="group1" />
                            </Col>
                          </Row>
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
              <Row>
                <Col xs={12}>
                  <Card className="bg-secondary">
                    <Card.Header as="h5">
                      18 Form of identification for subject
                      <span className="mandatory">*</span>
                    </Card.Header>
                    <Card.Body>
                      <Row className="pt-1 pb-3">
                        <Col xs={12} sm={6} md={4}>
                          <Form.Check label="Unknown" name="group1" />
                        </Col>
                      </Row>
                      <Form.Group as={Row}>
                        <Col sm={6} className="mb-32px">
                          <InputField
                            title="Type"
                            label="Other"
                            childBefore={
                              <Col>
                                <Form.Select aria-label="Default select example" className="mb-2">
                                  <option>Type</option>
                                  <option value="1">One</option>
                                  <option value="2">Two</option>
                                  <option value="3">Three</option>
                                </Form.Select>
                              </Col>
                            }
                            hasAddMore
                          />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField title="Number" label="ID Number" />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <Form.Label>Country</Form.Label>
                          <Form.Select aria-label="Default select example">
                            <option>Type</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                          </Form.Select>
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <Form.Label>Issuing State</Form.Label>
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
              <Row>
                <Col xs={12}>
                  <Card className="bg-secondary">
                    <Card.Header as="h5">
                      {"24 Relationship of the subject to an institution listed in Part III or IV "}
                      <small>(check all that apply)</small>
                    </Card.Header>
                    <Card.Body>
                      <Row className="mb-4 bb align-items-center">
                        <Col xs={12} md={10}>
                          <Card.Title as="h6">Information</Card.Title>
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
                          <Form.Label>
                            <small>{"a "}</small>
                            Institution TIN
                          </Form.Label>
                          <Row className="pt-1 pb-1">
                            <Col xs={12} sm={6}>
                              <Form.Select aria-label="Default select example" className="mb-2">
                                <option>Type</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                              </Form.Select>
                            </Col>
                          </Row>
                          <Row className="pt-1 pb-1">
                            <CheckBoxGroup
                              title=""
                              numberOfColumns={4}
                              hasOtherWithInput
                              values={[
                                "Accountant",
                                "Agent",
                                "Appraiser",
                                "Attorney",
                                "Borrower",
                                "Customer",
                                "Director",
                                "Employee",
                                "No relationship to institution",
                                "Officer",
                                "Owner or Controlling Shareholder",
                              ]}
                            />
                          </Row>
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField title="25 Status of relationship" label="Status of relationship" />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField title="26 Action date" label="Date" />
                        </Col>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Card className="bg-secondary">
                    <Card.Header as="h5">
                      27 Financial institution TIN and account number(s) affected that are related to subject
                      <span className="mandatory">*</span>
                    </Card.Header>
                    <Card.Body>
                      <Row className="pt-1 pb-4">
                        <Col xs={12} sm={6} md={4}>
                          <Form.Check label="No known accounts involved" name="group1" />
                        </Col>
                      </Row>
                      <Row className="mb-4 bb align-items-center">
                        <Col xs={12} md={10}>
                          <Card.Title as="h6">Information</Card.Title>
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
                        <Col sm={6} className="mb-32px">
                          <InputField
                            title="Institution TIN"
                            label="TIN"
                            childAfter={
                              <div style={{ paddingLeft: 10 }}>
                                <Form.Check label="Non-US Financial Institution" name="group1" className="pt-1 pb-1" />
                              </div>
                            }
                          />
                        </Col>
                        <Col sm={6} className="mb-32px">
                          <InputField
                            title="Account number"
                            label="Number"
                            childAfter={
                              <div style={{ paddingLeft: 10 }}>
                                <Form.Check label="Closed? Yes" name="group1" className="pt-1 pb-1" />
                              </div>
                            }
                          />
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

export default Step4;
