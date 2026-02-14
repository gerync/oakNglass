import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import '../style/Login.css';

function RegisterForm() {

  function handleSubmit() {

  }



  return (
    <Container className="py-5 d-flex justify-content-center">
      <div className="registration-box p-4 shadow-sm rounded" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center mb-4" style={{ fontFamily: 'serif' }}>Regisztráció</h2>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teljes név</Form.Label>
                <Form.Control required type="text" placeholder="Kovács János" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email cím</Form.Label>
                <Form.Control required type="email" placeholder="janos@pelda.hu" />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Telefonszám</Form.Label>
            <Form.Control type="tel" placeholder="+36 30 123 4567" />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Jelszó</Form.Label>
                <Form.Control required type="password" placeholder="******" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Jelszó megerősítése</Form.Label>
                <Form.Control required type="password" placeholder="******" />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Születési dátum</Form.Label>
            <Form.Control type="date" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Szállítási cím</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Város, utca, házszám..." />
          </Form.Group>
          <div className="text-center mt-4">
            <Button type="submit" className="px-5 btn-submit">
              Fiók létrehozása
            </Button>
          </div>
        </Form>
      </div>
    </Container>


  )
};

export default RegisterForm;