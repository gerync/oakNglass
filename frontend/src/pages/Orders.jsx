import { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Spinner } from 'react-bootstrap'
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-toastify';

function Orders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);



  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.ORDERS.GET_ALL}`,
          { credentials: 'include' }
        );
        const data = await res.json();

        if (res.ok && !ignore) {
          setOrders(data);
        }
      } catch {
        if (!ignore) toast.error('Hiba történt a kedvencek betöltése közben!');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; }
  }, []);

  return (
    <Container className="my-5" >
      <Card className="shadow-sm border-0 bg-content">
        <Card.Header className="bg-content py-3">
          <h1>Rendelések</h1>
        </Card.Header>

        <Card.Body>
          <ListGroup variant="flush">

            {
              loading ? (<Spinner animation='border' />) :
                orders.length > 0 ? (
                  orders.map((item) => (
                    <ListGroup.Item id={item.OrderID}>
                      <h5 className="mb-1 text-custom">{item.OrderID}</h5>
                      <p className="text-muted-custom mb-0 small text-uppercase"> Vásárlás dátuma: {item.OrderDate}</p>

                      <div className="fw-bold mt-2 text-danger">
                        Összesített ár: {item.TotalPriceHUF.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Ft
                      </div>
                    </ListGroup.Item>
                  ))
                ) : (
                  <h3>Rendelései itt jelennek meg.</h3>
                )
            }
          </ListGroup>
        </Card.Body>
      </Card>
    </Container >
  );
}

export default Orders;