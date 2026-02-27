import { Modal, Container, Form, Button, Row, Col, Card, Stack, ListGroup } from "react-bootstrap";
import ProductCarousel from "./ProductCarousel";
import '../style/ProductModal.css';
import { CartContext, GlobalContext } from '../contexts/Contexts';
import { useContext } from "react";

function ProductModal({ show, setShow, selected }) {
  const { addItemToCart } = useContext(CartContext);
  const { isLoggedIn } = useContext(GlobalContext);
  return (
    <Modal show={show} onHide={() => { setShow(); }} centered>

      <Modal.Header closeButton className="border-0" />

      <Modal.Body className='overflow-hidden' >
        <Container className="py-3 justify-content-center px-4">
          <h2>Termék megtekintése</h2>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col sm={12} md={6} className="mb-3 mb-md-0">
                  <ProductCarousel
                    images={selected.images}
                    ImageMaxHeight
                  />
                </Col>

                <Col sm={12} md={6}>
                  <Stack gap={3}>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Kiszerelés:</strong> {selected.contentML} ml
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Alkoholtartalom:</strong> {selected.alcoholPercent}%
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Raktáron:</strong> {selected.stock} db
                      </ListGroup.Item>
                    </ListGroup>

                    <div className="fs-4 fw-bold text-danger">
                      {selected.priceHUF
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                      Ft
                    </div>

                    <Button
                      size="lg"
                      className="w-100"
                      disabled={selected.stock === 0 || !isLoggedIn}
                      onClick={() => {
                        if (isLoggedIn) {
                          addItemToCart(selected)

                        }
                      }
                      }
                    >
                      Kosárba helyezés
                    </Button>
                  </Stack>
                </Col>

              </Row>
            </Card.Body>
          </Card>

        </Container>
      </Modal.Body>
    </Modal>
  )
}
export default ProductModal;
<Container className="py-4">
  <h2 className="mb-4 text-center">Termék megtekintése</h2>


</Container>