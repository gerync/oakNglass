import { useEffect, useState } from "react";
import { ENDPOINTS } from "../api/endpoints";
import { Container, Card, Row, Col } from "react-bootstrap";

function Profil() {
  const [user, setUser] = useState({});

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.USER.PROFILE}`,
        {
          credentials: 'include',
        }
      )
      const data = res.json();
      setUser(data);
    }
    fetchUserData();
  }, []);
  return (
    <Container className="my-5" >
      <Card className="shadow-sm border-0 bg-content">
        <Card.Header className="bg-content py-3">
          <h1>Profil adatai</h1>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>Teljes név: {user.fullname}</Col>
            <Col md={6}>Email cím: {user.email}</Col>
            <Col md={6}>Telefonszám: {user.mobile}</Col>
            <Col md={6}>Cím: {user.address}</Col>
            <Col md={6}>Születési dátum: {user.birthdate}</Col>
            <Col md={6}>Fiók típusa: {user.role === 'admin' ? 'Admin' : 'Felhasználó'}</Col>
          </Row>
        </Card.Body>
      </Card>
    </Container >
  )
}

export default Profil;