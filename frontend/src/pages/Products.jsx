import { Container, Row, Col } from "react-bootstrap";
import { Slider } from "antd";
import '../style/Products.css';

function Products() {
  return (
    <>
      <Container fluid className="content-bg mt-3">
        <Row>
          <Col md='3'>
            <h3 className="sort-header">Szűrés</h3>
            <div>
              Alkoholtartalom
              <Slider range defaultValue={[0, 2000]} className="custom-range"/>
            </div>
            <div>
              Űrtartalom
            </div>
            <div>
              Elérhető mennyiség
            </div>
          </Col>
          <Col md='9'><h3>Termékek</h3></Col>
        </Row>
      </Container>
    </>
  )
}

export default Products;