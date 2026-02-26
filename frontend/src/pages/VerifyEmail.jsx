import { useEffect, useState } from "react";
import { replace, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-toastify";

function VerifyEmail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(() => {
    return searchParams.get('code');
  });
  const [email, setEmail] = useState(() => {
    return searchParams.get('email');
  });
  const navigate = useNavigate();


  useEffect(() => {
    async function verify() {
      const res = await fetch(`${ENDPOINTS.AUTH.VERIFY}?code=${code}&email=${email}`, {
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
    }
    verify();
  }, [])

  useEffect(() => {
    if (!email || !code) {
      return navigate('/');
    }
  })


  return (
    <>
      <h1>Email verify</h1>

    </>
  );
}

export default VerifyEmail;