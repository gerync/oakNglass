import { Container, Row, Col, Button } from "react-bootstrap";
import { Calendar } from 'react-calendar';
import { useContext, useState } from "react";

import HomeCarousel from "../components/HomeCarousel";
import BlogSection from "../components/BlogSection";

import 'react-calendar/dist/Calendar.css';
import '../style/Calendar.css';

import Cookies from "js-cookie";
import { CartContext } from "../contexts/CartContext";



function Home() {
  const [today] = useState(() => {
    return Date.now();
  });
  const { cart, addItemToCart, removeItemFromCart, emptyCart } = useContext(CartContext);

  return (
    <>
      <Button onClick={() => {
        Cookies.set('loggedIn', 'true');
      }}>
        Login
      </Button> <br />
      <Button onClick={() => {
        Cookies.set('loggedIn', 'false');
      }}>
        Logout
      </Button><br />
      <Button onClick={() => {
        addItemToCart({ ProdId: 1 })
      }}>
        Item1 +
      </Button><br />
      <Button onClick={() => {
        addItemToCart({ ProdId: 2 })
      }}>
        Item2 +
      </Button><br />
      <Button onClick={() => {
        removeItemFromCart({ ProdId: 1 })
      }}>
        Item1 -
      </Button><br />
      <Button onClick={() => {
        removeItemFromCart({ ProdId: 2 })
      }}>
        Item2 -
      </Button><br />
      <Button onClick={() => {
        emptyCart();
      }}>
        empty
      </Button><br />

      <a onClick={() => console.log(cart)}>show</a>
      <Container>
        <HomeCarousel />
        <Row>
          <Col md="3">
            <Calendar value={today} />
          </Col>
          <Col md="9">
            <BlogSection />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home;