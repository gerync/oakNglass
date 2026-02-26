import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-toastify";
import { Container, Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [code] = useState(() => {
    return searchParams.get('code');
  });
  const [email] = useState(() => {
    return searchParams.get('email');
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [retypeError, setRetypeError] = useState("");
  const [pw, setPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);


  async function verify() {
    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.AUTH.RESET_PASSWORD}?code=${code}&email=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (res.ok) {
        toast.success('Jelszó frissítve!');

      } else {
        if (res.status === 400)
          toast.error('Érvénytelen kód!');

        if (res.status === 404)
          toast.error('A kód lejárt! Ellenőrizze a postafiókját.');

        else {
          toast.error('Sikertelen aktiválás.');

        }
      }
    } finally {
      navigate('/');
    }
  }

  useEffect(() => {
    if (!email || !code) {
      return navigate('/');
    }
  })

  const validatePassword = (value) => {
    let error = null;

    const passwordRegex = {
      length: /^.{8,}$/,
      lowercase: /[a-z]/,
      uppercase: /[A-Z]/,
      digit: /[0-9]/,
      special: /[!@#$%^&*(),.?":{}|<>]/
    }
    if (!passwordRegex.length.test(value)) error = 'A jelszónak legalább 8 karakter hosszúnak kell lennie'
    if (!passwordRegex.special.test(value)) error = 'A jelszónak tartalmaznia kell legalább egy speciális karaktert'
    if (!passwordRegex.digit.test(value)) error = 'A jelszónak tartalmaznia kell legalább egy számjegyet'
    if (!passwordRegex.lowercase.test(value)) error = 'A jelszónak tartalmaznia kell legalább egy kisbetűt'
    if (!passwordRegex.uppercase.test(value)) error = 'A jelszónak tartalmaznia kell legalább egy nagybetűt'

    if (error == null) setPw(value);
    setError(prev => ({ ...prev, password: error }));
  }
  const validateRetypePassword = (value) => {
    if (pw !== value) setRetypeError('A jelszavak nem egyeznek!');
    if (pw === value) setRetypeError(null);
  }



  return (
    <Container className="py-3 d-flex mt-5 justify-content-center">
      <div className="shadow-sm rounded p-4" style={{ maxWidth: 500 }}>
        <h1>Jelszó visszaállítása</h1>
        <Form onSubmit={verify}>
          <Form.Group className="mb-3">
            <Form.Label>Jelszó</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                required
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="*******"
                isInvalid={!!error.password}
                onChange={(e) => validatePassword(e.target.value)}
                className="border-end-0"
              />
              <InputGroup.Text
                onClick={() => setShowPassword(!showPassword)}
                className="border-left border-start-0 text-muted"
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
              <Form.Control.Feedback type='invalid'>
                {error.password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Jelszó újból</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                required
                type={showRetypePassword ? "text" : "password"}
                name="passworRetype"
                placeholder="*******"
                isInvalid={!!retypeError}
                onChange={(e) => validateRetypePassword(e.target.value)}
                className="border-end-0"
              />
              <InputGroup.Text
                onClick={() => setShowRetypePassword(!showRetypePassword)}
                className="border-left border-start-0 text-muted"
                style={{ cursor: 'pointer' }}
              >
                {showRetypePassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
              <Form.Control.Feedback type='invalid'>
                {retypeError}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <div className="text-center mt-4">
            <Button type="submit" className="px-5 btn-submit">
              Megerősítés
            </Button>
          </div>
        </Form>
      </div>

    </Container>
  );
}

export default ResetPassword;