import { Container, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import '../style/Login.css';
import { useContext, useState } from 'react';
import { GlobalContext } from '../contexts/Contexts';
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Cookies from 'js-cookie';

function LoginForm({ setShow, toggleShowPasswordReset }) {
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn, setIsAdmin } = useContext(GlobalContext);

  const [showPassword, setShowPassword] = useState(false);


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
          identifier: e.target.identifier.value.trim(),
          password: e.target.password.value.trim(),
        })
      });

      if (res.ok) {
        setIsLoggedIn(true);
        toast.success('Sikeres bejelentkezés');
        setShow(false);
        if (Cookies.get('isAdmin')) setIsAdmin(true);

      } else {
        if (res.status == 401) toast.error('Helytelen bejelentkezési adatok.');
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
            <InputGroup hasValidation>
              <Form.Control
                required
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="*******"
                className="border-end-0"
              />
              <InputGroup.Text
                onClick={() => setShowPassword(!showPassword)}
                className="border-left border-start-0 text-muted"
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
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

            </Button><br />
            <a className="pw-reset" onClick={() => { toggleShowPasswordReset(); setShow() }}>Elfelejtett jelszó?</a>
          </div>
        </Form>
      </div>
    </Container>
  )
};

export default LoginForm;