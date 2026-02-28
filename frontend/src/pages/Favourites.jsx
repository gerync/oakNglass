import { useState, useEffect } from "react";
import { Container, Spinner, Row, Col, Card, Button} from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-toastify";
import ProductCarousel from "../components/ProductCarousel";

function Favourites() {

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);


  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.FAVOURITES.GET}`);
        const data = await res.json();

        if (res.ok && !ignore) {
          setProducts(data.products);
        }
      } catch {
        if (!ignore) toast.error('Hiba történt az adatok betöltése közben!');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; }
  }, []);


  return (
    <Container className="content-bg mt-3">
      <h1 className="sort-header">
        Kedvenc termékek
      </h1>

      {
        loading
          ? (<Spinner animation='border' />)
          : (
            products.length > 0 ?
              (
                <Row >
                  {
                    products.map((item, idx) => (
                      <Col xs={12} sm={6} md={6} lg={4} key={idx}>
                        <Card className="mb-2 custom-card h-100" >
                          <ProductCarousel images={item.images} ImageMaxHeight={270} />
                          <Card.Title>{item.name}</Card.Title>
                          <Card.Body className="d-flex flex-column">
                            <Card.Text>
                              Kiszerelés: {item.contentML} ml<br />
                              Alkoholtartalom: {item.alcoholPercent}%<br />
                              Raktáron: {item.stock} db<br />
                              Ár: {item.priceHUF.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Forint<br />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  }
                </Row>
              )
              : (<>Nem található kedvenc.</>)
          )
      }
    </Container>



  )
}

export default Favourites;