import { useContext } from "react";
import { Container, Row, Col, Button, Card, ListGroup, InputGroup, FormControl } from "react-bootstrap";
import { CartContext } from "../contexts/Contexts";
import 'bootstrap-icons/font/bootstrap-icons.css';

function Cart() {
  const { cart, addItemToCart, removeItemFromCart, emptyCart, handleBlur, updateItemCount, deleteItemFromCart, cartCount } = useContext(CartContext);
  return (


    <Container className="my-5" >
      <Card className="shadow-sm border-0 bg-content">
        <Card.Header className="bg-content py-3">
          <h4 className="mb-0">Kosár tartalma</h4>
        </Card.Header>

        <ListGroup variant="flush">
          {/* Példa egy elemre - ezt érdemes map-elni a cartItems-en */}
          {cart.length > 0 ? (cart.map(item => (
            <div key={item.ProdID}>
              <ListGroup.Item className="py-4 bg-content">
                <Row className="align-items-center">

                  <Col md={6}>
                    <h5 className="mb-1 text-custom">{item.name}</h5>

                    <p className="text-muted-custom mb-0 small text-uppercase">
                      Kiszerelés: {item.contentML} ml | Alkoholtartalom: {item.alcoholPercent}%
                    </p>
                    <p className="text-muted-custom mb-0 small text-uppercase"> Elérhető: {item.stock} db</p>

                    <div className="fw-bold mt-2 text-danger">
                      {item.priceHUF.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Ft
                    </div>
                  </Col>

                  <Col md={6} className="d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                    <InputGroup className="me-3" style={{ maxWidth: '130px' }}>
                      <Button variant="outline-secondary" size="sm" onClick={() => removeItemFromCart(item)}>-</Button>
                      <FormControl
                        className="text-center bg-content border-secondary text-custom"
                        value={item.count}
                        readOnly
                        onChange={(e) => updateItemCount(item, e.target.value)}
                        onBlur={(e) => handleBlur(item.ProdID, e.target.value)}
                      />
                      <Button variant="outline-secondary" size="sm" onClick={() => addItemToCart(item)}>+</Button>
                    </InputGroup>

                    <Button
                      variant="link"
                      className="text-danger p-0 text-decoration-none"
                      onClick={() => { deleteItemFromCart(item.ProdID) }}
                    >
                      <i className="bi bi-trash me-1" /> Eltávolítás
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            </div >
          ))) : <h3>A kosár üres</h3>
          }
        </ListGroup>

        {/* Alsó gombok */}
        <Card.Footer className="bg-content py-4">
          <div
            className="d-flex flex-column flex-md-row justify-content-between gap-3"
          >
            <Button
              variant=""
              className="px-4 py-2 btn-outline-custom"
              onClick={() => emptyCart()}
              disabled={cartCount < 1}
            >
              Kosár kiürítése
            </Button>
            <Button
              style={{ backgroundColor: '#7a0019', borderColor: '#7a0019' }}
              className="px-5 py-2 shadow"
              disabled={cartCount < 1}
            >
              Rendelés leadása
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </Container >
  );
}

export default Cart;
