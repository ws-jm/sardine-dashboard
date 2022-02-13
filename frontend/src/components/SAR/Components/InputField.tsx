import React from "react";
import { Form, FloatingLabel, Col, Row, Button } from "react-bootstrap";
import { MdAdd } from "react-icons/md";

interface InputFieldProps {
  title: React.ReactElement | string;
  label: string;
  placeholder?: string;
  childBefore?: React.ReactElement;
  childAfter?: React.ReactElement;
  hasAddMore?: boolean;
  addMoreAction?: () => void;
}

const InputField = (p: InputFieldProps) => (
  <>
    <Form.Label>{p.title}</Form.Label>
    <Row>
      <Col>
        {p.childBefore ? p.childBefore : null}
        <FloatingLabel controlId="floatingInput" label={p.label} className="mb-2">
          <Form.Control type="text" placeholder={p.placeholder || p.label} />
        </FloatingLabel>
      </Col>
      {p.childAfter ? p.childAfter : null}
      {p.hasAddMore ? (
        <Col xs={2} className="text-end pt-1">
          <Button variant="primary" className="btnAdd">
            <MdAdd />
          </Button>
        </Col>
      ) : null}
    </Row>
  </>
);

export default InputField;
