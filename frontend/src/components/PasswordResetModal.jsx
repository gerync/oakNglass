import { Modal, Container, Form, Button } from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-toastify";

function PasswordResetModal({ show, setShow }) {
  async function sendResetEmail(e) {
    e.preventDefault();

    try {
      const identifier = e.target.identifier.value.trim();
      let body;

      if (identifier.includes('@')) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
          throw new Error('Helytelen email formátum');
        }
        body = JSON.stringify({
          email: identifier
        })
      } else {
        if (!/^\+?[0-9]{7,15}$/.test(identifier)) {
          throw new Error('Helytelen telefonszám formátum');
        }
        body = JSON.stringify({
          mobile: identifier
        })
      }

      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (res.ok) {
        toast.success('Email sikeresen elküldve.');
        setShow(false);
      } else {
        if (res.status == 400) toast.error(res.message)
        else {
          toast.error('Hiba történt az email küldése során, kérjük próbálja meg később!');
        }
      }
    } catch (error) {
      console.log(error)
      if (error.message.startsWith('Helytelen')) {
        toast.error(error.message);
      }
    }
  }


  return (
    <Modal show={show} onHide={() => { setShow(); }} centered>

      <Modal.Header closeButton className="border-0" />

      <Modal.Body className='overflow-hidden' >
        <Container className="py-3 d-flex justify-content-center">
          <div className="registration-box p-4 shadow-sm rounded" style={{ maxWidth: '600px', width: '100%' }}>
            <h2 className="text-center mb-4">Elfelejtett jelszó?</h2>
            <p className="text-muted">Adja meg az email címét, hogy el tudjuk küldeni a jelszava visszaállításához kellő linket. </p>
            <Form onSubmit={sendResetEmail}>
              <Form.Group className="mb-3">
                <Form.Label>Email cím vagy telefonszám</Form.Label>
                <Form.Control required type="text" name='identifier' />
                <div className="text-center mt-4">
                  <Button type="submit" className="px-5 btn-submit">
                    Email küldése
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </div>
        </Container>
      </Modal.Body>
    </Modal>
  )
}
export default PasswordResetModal;