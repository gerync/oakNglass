import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-toastify";
import { Container, Spinner } from "react-bootstrap";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [code] = useState(() => {
    return searchParams.get('code');
  });
  const [email] = useState(() => {
    return searchParams.get('email');
  });
  const navigate = useNavigate();


  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.AUTH.VERIFY}?code=${code}&email=${email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (res.ok) {
          toast.success('Email cím sikeresen megerősítve!');

        } else {
          if (res.status === 400)
            toast.error('Az email cím hitelesítése sikertelen. Érvénytelen kód!');

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
    verify();
  }, [code, email, navigate])

  useEffect(() => {
    if (!email || !code) {
      return navigate('/');
    }
  })


  return (
    <Container>
      <h1>Email cím hitelesítése folyamatban</h1>
      <Spinner animation="border" />
    </Container>
  );
}

export default VerifyEmail;