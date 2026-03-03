import { useContext, useState, useEffect } from "react";
import {
  Container, Row, Col, Card, ListGroup, Form,
  Button, Badge,
} from "react-bootstrap";
import { CartContext } from "../contexts/Contexts";
import { useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../style/Products.css'

import { toast } from "react-toastify";
import { ENDPOINTS } from "../api/endpoints";

const formatPrice = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const PAYMENT_METHODS = [
  { id: "card", label: "Bankkártyás fizetés", icon: "bi-credit-card" },
  { id: "transfer", label: "Banki átutalás", icon: "bi-bank" },
  { id: "cod", label: "Utánvét (készpénz)", icon: "bi-cash-stack" },
];

const SHIPPING_COST = 1490;

function Checkout() {
  const { cart, cartCount, priceSum, emptyCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [billing, setBilling] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [payment, setPayment] = useState("card");

  const [card, setCard] = useState({
    number: "", name: "", expiry: "", cvv: "",
  });

  const [validated, setValidated] = useState(false);

  const total = priceSum + (cartCount > 0 ? SHIPPING_COST : 0);

  const handleBilling = (e) => setBilling({ ...billing, [e.target.name]: e.target.value });
  const handleCard = (e) => setCard({ ...card, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }


    const orderContent = cart.map((item) => ({
      productId: item.ProdID,
      quantity: item.count
    }))

    try {

      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.ORDERS.POST}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shipmentAddress: billing.address,
            products: orderContent
          })
        }
      );


      if (res.ok) {
        toast.success('Rendelés sikeresen leadva');
        emptyCart();
        navigate("/kosar");
      } else {
        toast.error('Hiba történt a rendelés leadása közben. Kérem próbálja újra később');
        navigate("/kosar");
      }


    } catch {
      toast.error('Hálózati hiba történt.');
    }

  };

  const [user, setUser] = useState({});

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.USER.PROFILE}`,
        {
          credentials: 'include',
        }
      )
      const data = await res.json();
      setUser(data.user);
      handleBilling({ target: { name: 'name', value: user?.fullname || null } });
      handleBilling({ target: { name: 'email', value: user?.email || null } });
      handleBilling({ target: { name: 'phone', value: user?.mobile || null } });
      handleBilling({ target: { name: 'address', value: user?.address || null } });
    }
    fetchUserData();
  });

  return (
    <Container className="my-5">
      <h3 className="mb-4 text-custom">
        <i className="me-2" style={{ color: "#7a0019" }} />
        Rendelés véglegesítése
      </h3>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="g-4">

          <Col lg={7}>

            <Card className="shadow-sm border-0 bg-content mb-4">
              <Card.Header className="bg-content py-3">
                <h5 className="mb-0 text-custom">
                  <i className="bi bi-person-lines-fill me-2" />
                  Számlázási / szállítási adatok
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="text-muted-custom small">Teljes név</Form.Label>
                      <Form.Control
                        required
                        className="bg-content text-custom border-secondary"
                        name="name"
                        value={user.fullname || billing.name}
                        onChange={handleBilling}
                        placeholder="pl. Kiss János"
                      />
                      <Form.Control.Feedback type="invalid">Kötelező mező.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="text-muted-custom small">E-mail cím</Form.Label>
                      <Form.Control
                        required
                        type="email"
                        className="bg-content text-custom border-secondary"
                        name="email"
                        value={user.email || billing.email}
                        disabled={!!user.email}
                        onChange={handleBilling}
                        placeholder="pelda@email.com"
                      />
                      <Form.Control.Feedback type="invalid">Adjon meg érvényes e-mail címet.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="text-muted-custom small">Telefonszám</Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        className="bg-content text-custom border-secondary"
                        name="phone"
                        value={user.phone || billing.phone}
                        onChange={handleBilling}
                        placeholder="+36 30 123 4567"
                      />
                      <Form.Control.Feedback type="invalid">Kötelező mező.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="text-muted-custom small">Szállítási cím</Form.Label>
                      <Form.Control
                        required
                        className="bg-content text-custom border-secondary"
                        name="address"
                        value={user.address || billing.address}
                        onChange={handleBilling}
                        placeholder="1000 Város, Fő utca 12/A"
                      />
                      <Form.Control.Feedback type="invalid">Kötelező mező.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="text-muted-custom small">Megjegyzés (opcionális)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        className="bg-content text-custom border-secondary"
                        name="note"
                        value={billing.note}
                        onChange={handleBilling}
                        placeholder="pl. 2. emelet, csengő neve…"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 bg-content">
              <Card.Header className="bg-content py-3">
                <h5 className="mb-0 text-custom">
                  <i className="bi bi-wallet2 me-2" />
                  Fizetési mód
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-2 mb-3">
                  {PAYMENT_METHODS.map((m) => (
                    <Form.Check
                      key={m.id}
                      type="radio"
                      id={`pay-${m.id}`}
                      name="paymentMethod"
                      label={
                        <span className="text-custom">
                          <i className={`bi ${m.icon} me-2`} />
                          {m.label}
                        </span>
                      }
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                    />
                  ))}
                </div>

                {payment === "card" && (
                  <Row className="g-3 mt-1">
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="text-muted-custom small">Kártyaszám</Form.Label>
                        <Form.Control
                          required
                          className="bg-content text-custom border-secondary"
                          name="number"
                          maxLength={19}
                          value={card.number}
                          onChange={handleCard}
                          placeholder="1234 5678 9012 3456"
                        />
                        <Form.Control.Feedback type="invalid">Kötelező mező.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="text-muted-custom small">Kártyabirtokos neve</Form.Label>
                        <Form.Control
                          required
                          className="bg-content text-custom border-secondary"
                          name="name"
                          value={card.name}
                          onChange={handleCard}
                          placeholder="KISS JÁNOS"
                        />
                        <Form.Control.Feedback type="invalid">Kötelező mező.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="text-muted-custom small">Lejárat (HH/ÉÉ)</Form.Label>
                        <Form.Control
                          required
                          className="bg-content text-custom border-secondary"
                          name="expiry"
                          maxLength={5}
                          value={card.expiry}
                          onChange={handleCard}
                          placeholder="08/28"
                        />
                        <Form.Control.Feedback type="invalid">Kötelező mező.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="text-muted-custom small">CVV</Form.Label>
                        <Form.Control
                          required
                          type="password"
                          className="bg-content text-custom border-secondary"
                          name="cvv"
                          maxLength={4}
                          value={card.cvv}
                          onChange={handleCard}
                          placeholder="•••"
                        />
                        <Form.Control.Feedback type="invalid">Kötelező mező.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {payment === "transfer" && (
                  <div className="mt-2 p-3 rounded border border-secondary text-muted-custom small">
                    <p className="mb-1"><strong className="text-custom">Bankszámlaszám:</strong> 12345678-87654321-00000000</p>
                    <p className="mb-1"><strong className="text-custom">Megjegyzés:</strong> rendelésszám (visszaigazolóban)</p>
                    <p className="mb-0">Az utalás megérkezéséig a rendelés feldolgozása szünetel.</p>
                  </div>
                )}

                {payment === "cod" && (
                  <div className="mt-2 p-3 rounded border border-secondary text-muted-custom small">
                    Készpénzben fizet a futárnak átvételkor.
                    Az utánvét díja a szállítási költségbe bele van számítva.
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm border-0 bg-content sticky-top" style={{ top: "80px" }}>
              <Card.Header className="bg-content py-3">
                <h5 className="mb-0 text-custom">
                  <i className="bi bi-receipt me-2" />
                  Rendelés összegzés
                  <Badge
                    pill
                    className="ms-2 checkout-badge"
                  >
                    {cartCount} db
                  </Badge>
                </h5>
              </Card.Header>

              <ListGroup variant="flush">
                {cart.map((item) => (
                  <ListGroup.Item key={item.ProdID} className="bg-content py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-custom fw-semibold">{item.name}</div>
                        <div className="text-muted-custom small">
                          {item.contentML} ml | {item.alcoholPercent}% | {item.count} db
                        </div>
                      </div>
                      <div className="text-danger fw-bold text-nowrap ms-3">
                        {formatPrice(item.count * item.priceHUF)} Ft
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Card.Footer className="bg-content py-3">
                <div className="d-flex justify-content-between text-custom mb-1">
                  <span>Részösszeg</span>
                  <span>{formatPrice(priceSum)} Ft</span>
                </div>
                <div className="d-flex justify-content-between text-custom mb-3">
                  <span>Szállítás</span>
                  <span>{formatPrice(SHIPPING_COST)} Ft</span>
                </div>
                <hr className="border-secondary" />
                <div className="d-flex justify-content-between fw-bold fs-5 text-danger">
                  <span>Összesen</span>
                  <span>{formatPrice(total)} Ft</span>
                </div>

                <Button
                  type="submit"
                  className="w-100 mt-4 py-2 shadow"
                  style={{ backgroundColor: "#7a0019", borderColor: "#7a0019" }}
                >
                  <i className="bi bi-lock-fill me-2" />
                  Rendelés véglegesítése
                </Button>

                <Button
                  variant=""
                  className="w-100 mt-2 btn-outline-custom"
                  onClick={() => navigate("/kosar")}
                >
                  <i className="bi bi-arrow-left me-1" />
                  Vissza a kosárhoz
                </Button>
              </Card.Footer>
            </Card>
          </Col>

        </Row>
      </Form>
    </Container>
  );
}

export default Checkout;
