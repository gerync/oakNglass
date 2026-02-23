import { Card, Row, Col, Container, Spinner } from 'react-bootstrap'
import '../style/BlogSection.css';
import { ENDPOINTS } from '../api/endpoints';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.BLOGS.GET_ALL}`);
        const data = await res.json();

        if (res.ok && !ignore) {
          setBlogs(data.blogs);
        }
      }
      catch {
        if (!ignore) {
          toast.error('Hiba történt a blogok betöltése közben!');
        }
      }
      finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    }
  }, []);


  return (
    <Container fluid className='background d-flex align-items-center justify-content-center'>
      {
        loading
          ? (<Spinner animation='border' />)
          : blogs.length > 0
            ? (
              <Row  >
                {blogs.map((item, id) => (
                  <Col key={id} className='custom-card mt-4 mb-4'>
                    <Card>
                      <Card.Body>
                        <Card.Title>
                          {item.title}
                        </Card.Title>
                        <Card.Subtitle>{item.journalistname}</Card.Subtitle>
                        <hr />
                        <Card.Text>
                          {item.content}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (<h3>Nem található blog bejegyzés!</h3>)}
    </Container>
  )
}
export default BlogSection;