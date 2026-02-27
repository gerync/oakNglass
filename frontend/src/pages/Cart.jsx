import { useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { CartContext } from "../contexts/Contexts";

function Cart() {
  const { cart, addItemToCart, removeItemFromCart, emptyCart, handleBlur, updateItemCount } = useContext(CartContext);
  return (
    <Container className="content-bg">
      {cart.length > 0 ? (cart.map(item => (
        <div key={item.ProdId}>
          <Row>
            <Col md='6'>{item.ProdId}</Col>
            <Col md='4'>
              <div>
                <button onClick={() => removeItemFromCart(item)}>-</button>
                <input
                  type="number"
                  value={item.count}
                  onChange={(e) => updateItemCount(item.ProdId, e.target.value)}
                  onBlur={(e) => handleBlur(item.ProdId, e.target.value)}
                  style={{ width: '60px', textAlign: 'center' }}
                  min="1"
                />
                <button onClick={() => addItemToCart(item)}>+</button>
              </div>
            </Col>
            <Col md='2'><button onClick={emptyCart}>Eltávolítás</button></Col>
          </Row >

        </div >
      ))) : <h3>A kosár üres</h3>
      }

      <Row>
        <Col>
          <Button>
            Kosár kiűrítése
          </Button>
        </Col>
        <Col md='8' />
        <Col>
          <Button>
            Rendelés leadása
          </Button>
        </Col>
      </Row>
    </Container >



  );
}

export default Cart;
