import { Container, Row, Col, Card } from "react-bootstrap";
import '../style/AboutUs.css';

function AboutUs() {
  return (
    <Container fluid className="content-bg py-5">
      <div>
        <div>
          <h1 style={{ fontSize: '3.5rem', fontFamily: 'serif' }}>Cégünkről</h1>
          <hr />
        </div>

        <Row className="justify-content-center g-4 text-center">
          <Col xs={12} lg={4}>
            <p className="px-3">
              Öt generáció óta őrizzük a receptjeinket és az érlelés titkait;
              minden üveg egy-egy pillanat a múltból, amit gondosan továbbörökítünk.
            </p>
          </Col>

          <Col xs={12} lg={4}>
            <p className="px-3">
              Hisszük, hogy a minőség nem véletlen: a szőlő, a gyümölcs és a hordók
              találkozása adja azt az egyedi karaktert, ami a Kárpát-medencében
              híressé tett minket. Ha tőlünk rendel, nem csak italt kap, hanem
              egy darabot a történetünkből, a szezonokból és a generációk gondoskodásából.
            </p>
          </Col>

          <Col xs={12} lg={4}>
            <p className="px-3">
              Ma a webshopon keresztül hozzuk el ezt a hagyományt a világba:
              válogatott borok, kézműves pálinkák és fahordós whiskey-különlegességek
              várják azokat, akik értékelik a kézi munkát és a helyi ízeket.
            </p>
          </Col>
        </Row>
      </div>
      <div>
        <h1 style={{ fontSize: '3.5rem', fontFamily: 'serif' }}>Csapatunkról</h1>
        <hr />
        <Row>
          <Col md="6" lg="6">
            <Card className="mb-2">
              <Card.Img variant='top' src="src/assets/Manface.webp" />
              <Card.Title>
                Szücs Gergely
              </Card.Title>
              <Card.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit, augue quis ullamcorper maximus, mauris tellus fringilla eros, sed dictum risus purus id tortor. Nullam facilisis, elit id placerat pulvinar, felis nulla semper orci, non egestas purus felis nec diam.
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" lg="6">
            <Card>
              <Card.Img variant='top' src="src/assets/Manface.webp" />
              <Card.Title>
                Katona Zalán
              </Card.Title>
              <Card.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit, augue quis ullamcorper maximus, mauris tellus fringilla eros, sed dictum risus purus id tortor. Nullam facilisis, elit id placerat pulvinar, felis nulla semper orci, non egestas purus felis nec diam.
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>


    </Container>
  )
}

export default AboutUs;