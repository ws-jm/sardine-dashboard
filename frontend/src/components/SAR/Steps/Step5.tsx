import React from "react";
import { Container, Row, Col, Form, FloatingLabel, Button, InputGroup, FormControl, Card } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import InputField from "../Components/InputField";
import CheckBoxGroup from "../Components/CheckBoxGroup";

const Step5 = () => (
  <Container fluid="lg" className="pt-8 pb-6">
    <Row>
      <Col xs={12}>
        <Row className="bb align-items-center">
          <Col xs={12} md={8}>
            <h1 className="pageTitle">Part II Suspicious Activity Information</h1>
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
                <Form.Label>
                  29 Amount involved in this report
                  <span className="mandatory">*</span>
                </Form.Label>
                <Row className="pt-1 pb-1">
                  <Col xs={12} sm={6} md={4}>
                    <Form.Check label="Amount Unknown" name="group1" type="radio" />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Form.Check label="No amount involved" name="group1" type="radio" />
                  </Col>
                </Row>
                <Form.Label htmlFor="inlineFormInputGroup" visuallyHidden>
                  Amount
                </Form.Label>
                <InputGroup className="mb-2">
                  <InputGroup.Text>$</InputGroup.Text>
                  <FormControl id="inlineFormInputGroup" placeholder="Amount" />
                  <InputGroup.Text>.00</InputGroup.Text>
                </InputGroup>
              </Col>
              <Col sm={6} className="mb-32px">
                <Form.Label>
                  30 Date or date range of suspicious activity for this report
                  <span className="mandatory">*</span>
                  When completing item 32 through 42, check all that apply
                </Form.Label>
                <Row className="pt-1 pb-1">
                  <Col xs={6}>
                    <FloatingLabel controlId="floatingInput" label="Form">
                      <Form.Control type="text" placeholder="Form" />
                    </FloatingLabel>
                  </Col>
                  <Col xs={6}>
                    <FloatingLabel controlId="floatingInput" label="To">
                      <Form.Control type="text" placeholder="To" />
                    </FloatingLabel>
                  </Col>
                </Row>
              </Col>
              <Col sm={6} className="mb-32px">
                <Form.Label>
                  {"31 Cumulative amount "}
                  <small>(only applicable when "Continuing activity report" is checked in Item 1)</small>
                </Form.Label>
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
            <Row className="pt-5 pb-5">
              <Col xs={12}>
                <Card.Header as="h4" className="mb-4">
                  When completing item 32 through 42, check all that apply
                </Card.Header>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="32 Structuring"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={[
                      "Alters or cancels transaction to avoid BSA recordkeeping requirement",
                      "Alters or cancels transaction to avoid CTR requirement",
                      "Suspicious inquiry by customer regarding BSA reporting or recordkeeping requirements",
                      "Transaction(s) below BSA recordkeeping threshold",
                      "Transaction(s) below CTR threshold",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="33 Terrorist Financing"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={["Known or suspected terrorist/terrorist organization"]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="34 Fraud"
                    numberOfColumns={4}
                    hasOtherWithInput
                    values={[
                      "ACH",
                      "Advance fee",
                      "Business loan",
                      "Check",
                      "Consumer loan",
                      "Credit/Debit card",
                      "Healthcare/Public or private health insurance",
                      "Mail",
                      "Mass-marketing",
                      "Ponzi scheme",
                      "Pyramid scheme",
                      "Securities fraud",
                      "Wire",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="35 Gaming activities"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={[
                      "Chip walking",
                      "Minimal gaming with large transactions",
                      "Suspicious use of counter checks or markers",
                      "Unknown source of chips",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="36 Money Laundering"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={[
                      "Exchange small bills for large bills or vice versa",
                      "Funnel account",
                      "Suspicion concerning the physical condition of funds",
                      "Suspicion concerning the source of funds",
                      "Suspicious designation of beneficiaries, assignees or joint owners",
                      "Suspicious EFT/wire transfers",
                      "Suspicious exchange of currencies",
                      "Suspicious receipt of government payments/benefits",
                      "Suspicious use of multiple accounts",
                      "Suspicious use of noncash monetary instruments",
                      "Suspicious use of third-party transactors (straw-man)",
                      "Trade Based Money Laundering/Black Market Peso Exchange",
                      "Transaction out of pattern for customer(s)",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="37 Identification/Documentation"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={[
                      "Changes spelling or arrangement of name",
                      "Multiple individuals with same or similar identities",
                      "Provided questionable or false documentation",
                      "Provided questionable or false identification",
                      "Refused or avoided request for documentation",
                      "Single individual with multiple identities",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="38 Other Suspicious Activities"
                    numberOfColumns={4}
                    hasOtherWithInput
                    values={[
                      "Account takeover",
                      "Bribery or gratuity",
                      "Counterfeit instruments",
                      "Elder financial exploitation",
                      "Embezzlement/theft/ disappearance of funds",
                      "Forgeries",
                      "Human smuggling",
                      "Human trafficking",
                      "Identity theft",
                      "Little or no concern for product performance penalties, fees, or tax consequences",
                      "Misuse of position or self-dealing",
                      "Suspected public/private corruption (domestic)",
                      "Suspected public/private corruption (foreign)",
                      "Suspicious use of informal value transfer system",
                      "Suspicious use of multiple transaction locations",
                      "Transaction with no apparent economic, business, or lawful purpose",
                      "Transaction(s) involving foreign high risk jurisdiction",
                      "Two or more individuals working together",
                      "Unlicensed or unregistered MSB",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="39 Insurance"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={[
                      "Excessive insurance",
                      "Excessive or unusual cash borrowing against policy/annuity",
                      "Proceeds sent to or received from unrelated third party",
                      "Suspicious life settlement sales insurance (e.g.,STOLI’s, Viaticals)",
                      "Suspicious termination of policy or contract",
                      "Unclear or no insurable interest",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="40 Securities / Futures / Options"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={[
                      "Insider trading",
                      "Market manipulation",
                      "Misappropriation",
                      "Unauthorized pooling",
                      "Wash trading",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="41 Mortgage Fraud"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={[
                      "Application fraud",
                      "Appraisal fraud",
                      "Foreclosure/Short sale fraud",
                      "Loan Modification fraud",
                      "Origination fraud",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title="42 Cyber event"
                    numberOfColumns={3}
                    hasOtherWithInput
                    values={["Against Financial Institution(s)", "Against Financial Institution Customer(s)"]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title={
                      <>
                        {"45 Were any of the following product type(s) involved in the suspicious activity? "}
                        <small>(Check all that apply)</small>
                      </>
                    }
                    numberOfColumns={4}
                    hasOtherWithInput
                    values={[
                      "Bonds/Notes",
                      "Commercial mortgage",
                      "Commercial paper",
                      "Credit card",
                      "Debit card",
                      "Deposit account",
                      "Forex transactions",
                      "Futures/Options on futures",
                      "Hedge fund",
                      "Home equity line of credit",
                      "Home equity loan",
                      "Insurance/Annuity products",
                      "Microcap securities",
                      "Mutual fund",
                      "Options on securities",
                      "Prepaid access",
                      "Residential mortgage",
                      "Security futures products",
                      "Stocks",
                      "Swap, hybrid, or other derivatives",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <CheckBoxGroup
                    title={
                      <>
                        {
                          "46 Were any of the following instrument type(s)/payment mechanism(s) involved in the suspicious activity? "
                        }
                        <small>(Check all that apply)</small>
                      </>
                    }
                    numberOfColumns={4}
                    hasOtherWithInput
                    values={[
                      "Bank/Cashier's check",
                      "Foreign currency",
                      "Funds transfer",
                      "Gaming instruments",
                      "Government payment",
                      "Money orders",
                      "Personal/Business check",
                      "Travelers checks",
                      "U.S. Currency",
                    ]}
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <InputField
                    title={
                      <>
                        {"43 IP Address "}
                        <small>
                          (enter the IP address/date/timestamp of the subject's electronic internet based contact with the
                          financial institution, if known)
                        </small>
                      </>
                    }
                    label="IP Address"
                    hasAddMore
                    childAfter={
                      <>
                        <Col xs={12} sm={3}>
                          <FloatingLabel controlId="floatingInput" label="Date">
                            <Form.Control type="text" placeholder="Date" />
                          </FloatingLabel>
                        </Col>
                        <Col xs={12} sm={3}>
                          <FloatingLabel controlId="floatingInput" label="Timestamp (UTC)">
                            <Form.Control type="text" placeholder="Timestamp (UTC)" />
                          </FloatingLabel>
                        </Col>
                      </>
                    }
                  />
                </Row>
                <Row className="mb-4 pb-4 bb align-items-center">
                  <Form.Label>
                    {"44 Cyber Event Indicators "}
                    <small>
                      (select the appropriate indicator(s) from the drop-down list and provide the associated supporting
                      information)
                    </small>
                  </Form.Label>
                  <Col xs={12}>
                    <Row className="pt-1 pb-1 align-items-center">
                      <Form.Label column sm={3}>
                        Event type
                      </Form.Label>
                      <Col xs={12} sm={4}>
                        <Form.Select aria-label="Default select example">
                          <option>Type</option>
                          <option value="1">One</option>
                          <option value="2">Two</option>
                          <option value="3">Three</option>
                        </Form.Select>
                      </Col>
                      <Col xs={12} sm={3}>
                        <FloatingLabel controlId="floatingInput" label="Other">
                          <Form.Control type="text" placeholder="Other" />
                        </FloatingLabel>
                      </Col>
                      <Col xs={12} md={2}>
                        <Button variant="primary" className="btnAdd">
                          <MdAdd />
                        </Button>
                      </Col>
                    </Row>
                    <Row className="pt-1 pb-1 align-items-center">
                      <InputField
                        title="Event value"
                        label="Value"
                        childAfter={
                          <>
                            <Col xs={12} sm={3}>
                              <FloatingLabel controlId="floatingInput" label="Date">
                                <Form.Control type="text" placeholder="Date" />
                              </FloatingLabel>
                            </Col>
                            <Col xs={12} sm={3}>
                              <FloatingLabel controlId="floatingInput" label="Timestamp (UTC)">
                                <Form.Control type="text" placeholder="Timestamp (UTC)" />
                              </FloatingLabel>
                            </Col>
                          </>
                        }
                      />
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Form.Group as={Row}>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      {"47 Commodity type "}
                      <small>(if applicable)</small>
                    </>
                  }
                  label="Type"
                  hasAddMore
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField
                  title={
                    <>
                      {"48 Product/Instrument description "}
                      <small>(if needed)</small>
                    </>
                  }
                  label="Description"
                  hasAddMore
                />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField title="49 Market where traded" label="Market where traded" hasAddMore />
              </Col>
              <Col sm={6} className="mb-32px">
                <InputField title="50 CUSIP® number" label="Number" hasAddMore />
              </Col>
            </Form.Group>
          </Card>
        </Form>
      </Col>
    </Row>
  </Container>
);

export default Step5;
