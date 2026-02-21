import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { ENDPOINTS } from '../api/endpoints';
import { useState } from 'react';
import { toast } from 'react-toastify';
import '../style/Login.css';

function RegisterForm({ setIsLogin }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    validate(e);
    if(e.target.password.value !== e.target.password2.value) setErrors(prev => ({ ...prev, 'password2': 'A jelszavak nem egyeznek' }));
    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: e.target.fullName.value,
          email: e.target.email.value,
          mobile: e.target.phone.value || null,
          password: e.target.password.value,
          birthdate: e.target.birthDate.value,
          address: e.target.address.value || null,
          emailSubscribe: e.target.emailSubscribe.checked,
        })
      });

      if (res.ok) {
        toast.success('Sikeres regisztráció!');
        setIsLogin(true);

      } else {
        if (res.status == 401) toast.error('Helytelen adatok!');
      }
    } catch {
      toast.error('Hiba történt a regisztráció során!');
    } finally {
      setLoading(false);
    }
  }

  const validate = (name, value) => {
    let error = null;

    if (name === 'fullName') {
      if (value.length > 255) error = 'A név nem lehet ennyire hosszú!';
    }
    if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Helytelen email cím formátum!';
    }
    if (name === 'phone') {
      if (!/^\+?[0-9]{7,15}$/.test(value)) error = 'Helytelen telefonszám'
    }
    if (name === 'password') {
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
    }
    if (name === 'birthDate') {
      try {
        const birthDateObj = new Date(value);
        if (isNaN(birthDateObj.getTime())) {
          error = 'Érvénytelen születési dátum formátum';
        }

        const now = new Date();
        const age = now.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = now.getMonth() - birthDateObj.getMonth();
        const dayDiff = now.getDate() - birthDateObj.getDate();
        if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
          error = 'A regisztrációhoz legalább 18 évesnek kell lenned';
        }
      } catch {
        error = 'Érvénytelen születési dátum formátum';
      }
    }


    setErrors(prev => ({ ...prev, [name]: error }));
  }


  return (
    <Container className="py-3 d-flex justify-content-center">
      <div className="registration-box p-4 shadow-sm rounded" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center mb-4" style={{ fontFamily: 'serif' }}>Regisztráció</h2>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teljes név<span style={{ color: '#800020' }} title='Kötelező'>*</span></Form.Label>
                <Form.Control
                  name='fullName'
                  required
                  type="text"
                  placeholder="Kovács János"
                  isInvalid={!!errors.fullName}
                  onChange={(e) => validate(e.target.name, e.target.value)}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email cím<span style={{ color: '#800020' }} title='Kötelező'>*</span></Form.Label>
                <Form.Control
                  name='email'
                  required
                  type="email"
                  placeholder="janos@pelda.hu"
                  isInvalid={!!errors.email}
                  onChange={(e) => validate(e.target.name, e.target.value)}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Telefonszám</Form.Label>
            <Form.Control
              name='phone'
              type="tel"
              placeholder="+36 30 123 4567"
              isInvalid={!!errors.phone}
              onChange={(e) => validate(e.target.name, e.target.value)}
            />
            <Form.Control.Feedback type='invalid'>
              {errors.phone}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Jelszó<span style={{ color: '#800020' }} title='Kötelező'>*</span></Form.Label>
                <Form.Control
                  name='password'
                  required
                  type="password"
                  placeholder="******"
                  isInvalid={!!errors.password}
                  onChange={(e) => validate(e.target.name, e.target.value)}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Jelszó megerősítése<span style={{ color: '#800020' }} title='Kötelező'>*</span></Form.Label>
                <Form.Control
                  name='password2'
                  required
                  type="password"
                  placeholder="******"
                  isInvalid={!!errors.password2}
                  onChange={(e) => validate(e.target.name, e.target.value)}
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.password2}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Születési dátum<span style={{ color: '#800020' }} title='Kötelező'>*</span></Form.Label>
            <Form.Control
              name='birthDate'
              required
              type="date"
              isInvalid={!!errors.birthDate}
              onChange={(e) => validate(e.target.name, e.target.value)}
            />
            <Form.Control.Feedback type='invalid'>
              {errors.birthDate}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Szállítási cím</Form.Label>
            <Form.Control
              name='address'
              as="textarea"
              rows={2}
              placeholder="Város, utca, házszám..."
              style={{ resize: 'none' }}
              isInvalid={!!errors.address}
              onChange={(e) => validate(e.target.name, e.target.value)}
            />
            <Form.Control.Feedback type='invalid'>
              {errors.address}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Rendelés esetén kötelező megadni.
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Row>
              <Col md='1'><Form.Check name='emailSubscribe' id='emailSubscribe' /></Col>
              <Col><Form.Label htmlFor='emailSubscribe' style={{ cursor: 'pointer', userSelect: 'none' }} >Kívánok feliratkozni hírlevelekre</Form.Label></Col>
            </Row>
          </Form.Group>

          <div className="text-center mt-4">
            <Button type="submit" className="px-5 btn-submit">
              {loading ?
                (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Fiók létrehozása...
                  </>
                ) : ('Fiók létrehozása')
              }
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  )
};

export default RegisterForm;