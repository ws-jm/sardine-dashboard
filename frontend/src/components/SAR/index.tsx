import React, { useState } from "react";
import { Container, Row, Col, Tab, Navbar, Nav } from "react-bootstrap";
import Step1 from "./Steps/Step1";
import Step2 from "./Steps/Step2";
import Step3 from "./Steps/Step3";
import Step4 from "./Steps/Step4";
import Step5 from "./Steps/Step5";
import Step6 from "./Steps/Step6";
import navBrand from "../../utils/logo/FinCEN.svg";
import Footer from "./Components/Footer";
import { StylesContainer } from "./styles";

const tabs = [
  "Home content",
  "Filing Institution Contact Information",
  "Financial Institution Where Activity Occurred",
  "Subject Information",
  "Suspicious Activity Information",
  "Narrative",
];

const SAR = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const managePageChange = (page: number) => {
    if (page <= tabs.length) {
      setCurrentStep(page);
    } else {
      alert("form submitted");
    }
  };

  return (
    <StylesContainer>
      <Nav className="bg-light pt-3 pb-3">
        <Container fluid="lg">
          <Navbar.Brand href="/" className="pt-0 pb-0 m-0" style={{ display: "block" }}>
            <Row className="align-items-center">
              <Col md={2} lg={1}>
                <img src={navBrand} className="img-fluid" alt="" />
              </Col>
              <Col md={10} lg={3}>
                <span className="brandName">Suspicious Activity Report (SAR)</span>
              </Col>
            </Row>
          </Navbar.Brand>
        </Container>
      </Nav>
      <Tab.Container id="left-tabs-example" defaultActiveKey="tab-1" activeKey={`tab-${currentStep}`}>
        <Nav className="bg-blue text-white">
          <Container fluid="lg">
            {tabs.map((title, index) => (
              <Nav.Item onClick={() => setCurrentStep(index + 1)} key={title}>
                <Nav.Link eventKey={`tab-${index + 1}`}>
                  <span className="stepHeader">
                    Step
                    <span className="stepCount">{index + 1}</span>
                  </span>
                  <span className="stepTitle">{title}</span>
                </Nav.Link>
              </Nav.Item>
            ))}
          </Container>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="tab-1">
            <Step1 />
          </Tab.Pane>
          <Tab.Pane eventKey="tab-2">
            <Step2 />
          </Tab.Pane>
          <Tab.Pane eventKey="tab-3">
            <Step3 />
          </Tab.Pane>
          <Tab.Pane eventKey="tab-4">
            <Step4 />
          </Tab.Pane>
          <Tab.Pane eventKey="tab-5">
            <Step5 />
          </Tab.Pane>
          <Tab.Pane eventKey="tab-6">
            <Step6 />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      <Footer page={currentStep} onPageChanged={managePageChange} />
    </StylesContainer>
  );
};

export default SAR;

export const SAR_PATH = "/sar";
