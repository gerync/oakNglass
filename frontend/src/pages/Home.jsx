import { Container, Row, Col } from "react-bootstrap";
import { Calendar } from 'react-calendar';
import { useState } from "react";

import HomeCarousel from "../components/HomeCarousel";
import BlogSection from "../components/BlogSection";

import 'react-calendar/dist/Calendar.css';
import '../style/Calendar.css';



function Home() {
  const [today] = useState(() => {
    return Date.now();
  });


  return (
    <>
      <Container>
        <HomeCarousel />
        <Row>
          <Col md="3">
            <Calendar value={today}/>
          </Col>
          <Col md="9">
          <BlogSection/>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home;