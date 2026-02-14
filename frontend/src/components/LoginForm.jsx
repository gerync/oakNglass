import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import '../style/Login.css';
import { useContext, useState } from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-toastify';

function LoginForm({ setShow }) {
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn } = useContext(GlobalContext);



  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: e.target.identifier.value,
          password: e.target.password.value,
        })
      });

      if (res.ok) {
        setIsLoggedIn(true);
        toast.success('Sikeres bejelentkezés');
        setShow(false);

      }else{
        if(res.status == 401) toast.error('Helytelen bejelentkezési adatok.');
      }
    } catch {
      toast.error('Hiba történt a bejelentkezés során!');
    } finally {
      setLoading(false);
    }
  }



  return (
    <Container className="py-3 d-flex justify-content-center">
      <div className="registration-box p-4 shadow-sm rounded" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center mb-4">Bejelentkezés</h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email cím vagy telefonszám</Form.Label>
            <Form.Control required type="text" name='identifier' placeholder="janos@pelda.hu, +36 30 123 4567" />
          </Form.Group>


          <Form.Group className="mb-3">
            <Form.Label>Jelszó</Form.Label>
            <Form.Control required type="password" name='password' placeholder="******" />
          </Form.Group>


          <div className="text-center mt-4">
            <Button type="submit" className="px-5 btn-submit">
              {loading ?
                (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Bejelentkezés...
                  </>
                ) : ('Bejelentkezés')
              }

            </Button>
          </div>
        </Form>
      </div>
    </Container>


  )
};

export default LoginForm;