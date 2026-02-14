import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import '../style/Login.css';

function LoginForm() {

  function handleSubmit(){

  }


  return (
    <Container className="py-5 d-flex justify-content-center">
      <div className="registration-box p-4 shadow-sm rounded" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center mb-4" style={{ fontFamily: 'serif' }}>Bejelentkezés</h2>

        <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email cím vagy telefonszám</Form.Label>
                <Form.Control required type="text" placeholder="janos@pelda.hu | +36 30 123 4567" />
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

          <div className="text-center mt-4">
            <Button type="submit" className="px-5 btn-submit">
              Bejelentkezés
            </Button>
          </div>
        </Form>
      </div>
    </Container>


  )
};

export default LoginForm;