import { Form, FloatingLabel, Button, Modal, ModalProps } from "react-bootstrap";

interface PopupProps extends ModalProps {
  isSubject?: boolean;
}

const ManageOptionPopup = (props: PopupProps) => {
  const nameValue = props.isSubject ? "Subject" : "Financial Institution";
  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title as="h3" id="contained-modal-title-vcenter">
          {`Manage ${nameValue}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label>
          {`${nameValue} Name`}
          <span className="mandatory">*</span>
        </Form.Label>
        <FloatingLabel controlId="floatingInput" label={`${nameValue} name`}>
          <Form.Control type="text" placeholder="type here" />
        </FloatingLabel>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageOptionPopup;
