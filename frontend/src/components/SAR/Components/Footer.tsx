import { Row, Col, Button, Container } from "react-bootstrap";
import { MdSend, MdNavigateBefore, MdFileDownload, MdPlaylistAddCheck, MdNavigateNext } from "react-icons/md";

interface FooterProps {
  page: number;
  onPageChanged: (page: number) => void;
}

const Footer = (p: FooterProps) => (
  <Container fluid="lg" style={{ paddingBottom: 30 }}>
    <Row className="justify-content-md-center footer">
      <Col xs={12} md={4} className="align-self-start">
        {p.page > 1 ? (
          <Button size="lg" variant="outline-primary btnBack" onClick={() => p.onPageChanged(p.page - 1)}>
            <MdNavigateBefore className="ic icBack" /> Back
          </Button>
        ) : null}
      </Col>
      <Col xs={12} md={4} className="align-self-center">
        <Button size="lg" variant="outline-info">
          <MdFileDownload className="ic" /> Download
        </Button>
        <Button size="lg" variant="outline-success">
          <MdPlaylistAddCheck className="ic" /> Validate
        </Button>
      </Col>
      <Col xs={12} md={4} className="align-self-end text-end">
        <Button size="lg" variant="outline-primary btnNext" onClick={() => p.onPageChanged(p.page + 1)}>
          {p.page === 6 ? (
            <>
              <MdSend className="ic" /> Submit
            </>
          ) : (
            <>
              Next <MdNavigateNext className="ic icNext" />
            </>
          )}
        </Button>
      </Col>
    </Row>
  </Container>
);

export default Footer;
