import React from "react";
import { Form, Col, Row, FloatingLabel } from "react-bootstrap";

interface InputFieldProps {
  title: React.ReactElement | string;
  numberOfColumns: number;
  hasOtherWithInput?: boolean;
  values: string[];
}

const CheckBoxGroup = (p: InputFieldProps): JSX.Element => {
  const splitArrayIntoChunks = () => {
    const chunks = [];
    let i = 0;
    while (i < p.values.length) {
      chunks.push(p.values.slice(i, (i += p.numberOfColumns)));
    }
    return chunks;
  };

  return (
    <>
      <Form.Label>{p.title}</Form.Label>
      {splitArrayIntoChunks().map((values) => (
        <Row className="pt-1 pb-1" key={values[0]}>
          {values.map((val, index) => (
            <Col className="pt-1 pb-1" key={val}>
              <Form.Check label={val} name={`check-${index}`} />
            </Col>
          ))}
          {values.length < p.numberOfColumns ? <Col /> : null}
        </Row>
      ))}
      {p.hasOtherWithInput ? (
        <Col xs={12} sm={6} md={3}>
          <Col className="pb-1 pt-1">
            <Form.Check label="Other" name="group1" />
          </Col>
          <Col xs={12} className="pb-1 pt-1">
            <FloatingLabel controlId="floatingInput" label="Other">
              <Form.Control type="text" placeholder="Other" />
            </FloatingLabel>
          </Col>
        </Col>
      ) : null}
    </>
  );
};

export default CheckBoxGroup;
