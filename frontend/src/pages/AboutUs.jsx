import { Container, Row, Col, Card } from "react-bootstrap";
import '../style/AboutUs.css';
import image from '../assets/Manface.webp'

function AboutUs() {
  const Date1 = new Date('2007/03/19');
  const Date2 = new Date('2006/08/16');
  const Today = new Date();
  const MILLISECONDS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;


  return (
    <Container fluid className="content-bg py-5 mt-3">
      <div>
        <div>
          <h1>Cégünkről</h1>
          <hr />
        </div>

        <Row className="justify-content-center g-4">
          <Col xs={12} lg={4} className="text-center">
            <p className="px-3 m-auto about-us-p">
              Öt generáció óta őrizzük a receptjeinket és az érlelés titkait;
              minden üveg egy-egy pillanat a múltból, amit gondosan továbbörökítünk.
            </p>
          </Col>


          <Col xs={12} lg={4} className="text-center text-md-end text-lg-center">
            <p className="px-3 m-auto about-us-p">
              Hisszük, hogy a minőség nem véletlen: a szőlő, a gyümölcs és a hordók
              találkozása adja azt az egyedi karaktert, ami a Kárpát-medencében
              híressé tett minket. Ha tőlünk rendel, nem csak italt kap, hanem
              egy darabot a történetünkből, a szezonokból és a generációk gondoskodásából.
            </p>
          </Col>

          <Col xs={12} lg={4} className="text-center m-aut">
            <p className="px-3 m-auto about-us-p">
              Ma a webshopon keresztül hozzuk el ezt a hagyományt a világba:
              válogatott borok, kézműves pálinkák és fahordós whiskey-különlegességek
              várják azokat, akik értékelik a kézi munkát és a helyi ízeket.
            </p>
          </Col>
        </Row>
      </div>
      <div>
        <h1 className="mt-5">Csapatunkról</h1>
        <hr />
        <Row>
          <Col md="6" lg="6">
            <Card className="mb-2">
              <Card.Img variant='top' src={image} />
              <Card.Title>
                Szücs Gergely
                <br />
                <span className="text-secondary">{((Today - Date1) / MILLISECONDS_IN_YEAR).toString().split('.')[0]}</span>
              </Card.Title>
              <Card.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit, augue quis ullamcorper maximus, mauris tellus fringilla eros, sed dictum risus purus id tortor. Nullam facilisis, elit id placerat pulvinar, felis nulla semper orci, non egestas purus felis nec diam.
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" lg="6">
            <Card>
              <Card.Img variant='top' src={image} />
              <Card.Title>
                Katona Zalán
                <br />
                <span className="text-secondary">{((Today - Date2) / MILLISECONDS_IN_YEAR).toString().split('.')[0]}</span>
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