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
    <Container>
      <Row>
        <Col md="12">
          <HomeCarousel />
        </Col>
        <Col md="4">
          <Calendar value={today} className='m-auto mb-3' />
        </Col>
        <Col md="8">
          <BlogSection />
        </Col>
      </Row>
    </Container>
  )
}

export default Home;