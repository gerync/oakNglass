import { Card, Row, Col, Container } from 'react-bootstrap'
import '../style/BlogSection.css';
import { useState } from 'react';

function BlogSection() {
  const [blogs, setBlogs] = useState([]);


  return (
    <Container fluid className='background d-flex align-items-center justify-content-center'>
      {blogs.length < 1 ? (<h3>Nem található blog bejegyzés!</h3>) : (
        <Row  >
          {blogs.map((item, id) => (
            <Col key={id} className='custom-card mt-4 mb-4'>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {item.title}
                  </Card.Title>
                  <hr />
                  <Card.Text>
                    {item.desc}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
export default BlogSection;