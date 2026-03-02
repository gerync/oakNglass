import { useState, useEffect } from "react";
import { Container, Spinner, Row, Col, Card } from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-toastify";
import ProductCarousel from "../components/ProductCarousel";
import { FaStar, FaRegStar } from "react-icons/fa";

function Favourites() {

  const [loading, setLoading] = useState(false);
  const [fav, setFav] = useState([]);


  useEffect(() => {
    const fetchFav = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.FAVOURITES.GET}`,
          { credentials: 'include' }
        );
        const data = await res.json();

        if (res.ok) {
          setFav(data.favourites);
        }
      } catch {
        toast.error('Hiba történt a kedvencek betöltése közben!');
      } finally {
        setLoading(false);
      }
    };
    fetchFav();
  }, []);

  const toggleFav = async (item) => {
    const isFav = fav.some(f => f.id === item.ProdID);
    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.FAVOURITES.POST_DELETE}${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setFav(prev =>
          isFav
            ? prev.filter(f => f.id !== item.ProdID)
            : [...prev, item]
        );
      } else {
        toast.error('Hiba történt a kedvenc módosítása közben!');
      }
    } catch {
      toast.error('Hiba történt a kedvenc módosítása közben!');
    }
  };


  return (
    <Container className="my-5" >
      <Card className="shadow-sm border-0 bg-content">
        <Card.Header className="bg-content py-3">
          <h1>Kedvenc termékek</h1>
        </Card.Header>

        <Card.Body>
          {
            loading
              ? (<Spinner animation='border' />)
              : (
                fav.length > 0 ?
                  (
                    <Row >
                      {
                        fav.map((item) => (
                          <Col xs={12} sm={6} md={6} lg={4} key={item.id}>
                            <Card className="mb-2 h-100" >
                              <div style={{ position: 'relative' }}>
                                <ProductCarousel images={item.images} ImageMaxHeight={270} />
                                <button
                                  onClick={() => toggleFav(item)}
                                  title='Eltávolítás a kedvencekből'
                                  style={{
                                    position: 'absolute', top: 8, right: 8,
                                    background: 'rgba(255,255,255,0.85)', border: 'none',
                                    borderRadius: '50%', width: 36, height: 36,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', zIndex: 10, fontSize: 18,
                                    color: '#f5a623',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                                  }}
                                >
                                  <FaStar />
                                </button>
                              </div>
                              <Card.Title>{item.name}</Card.Title>
                            </Card>
                          </Col>
                        ))
                      }
                    </Row>
                  )
                  : (<>Nem található kedvenc.</>)
              )
          }
        </Card.Body>
      </Card>
    </Container >
  )
}

export default Favourites;