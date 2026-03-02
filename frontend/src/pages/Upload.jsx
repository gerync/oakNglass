import { useEffect, useState } from 'react';
import { Card, Container, Form, Row, Col, Image, Button } from 'react-bootstrap';
import '../style/Upload.css';
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-toastify';



function Upload() {

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    e.target.value = null;
  };


  const handleRemove = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevUrls) => {
      const urlToRemove = prevUrls[index];
      URL.revokeObjectURL(urlToRemove);
      return prevUrls.filter((_, i) => i !== index);
    });
  };

  const handleRemoveAll = () => {
    setSelectedFiles([]);
    setPreviews((prevUrls) => {
      prevUrls.forEach((urlToRemove) => {
        URL.revokeObjectURL(urlToRemove);
      })
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      name: e.target.name.value,
      alccoholPerc: e.target.alcoholPerc.value,
      contentML: e.target.contentML.value,
      priceHUF: e.target.priceHUF.value,
      Stock: e.target.Stock.value,
      images: selectedFiles
    }

    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.PRODUCTS.UPLOAD}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Sikeres feltöltés!');

        e.target.name.value = null;
        e.target.alcoholPerc.value = null;
        e.target.contentML.value = null;
        e.target.priceHUF.value = null;
        e.target.Stock.value = null;
        handleRemoveAll();


      } else {
        if (res.status == 401) toast.error('Nincs jogosultsága a művelethez!');
      }
    } catch {
      toast.error('Hiba történt feltöltés során!');
    }
  }





  return (
    <>
      <Container className="my-5" >
        <Card className="shadow-sm border-0 bg-content">
          <Card.Header className="bg-content py-3">
            <h4 className="mb-0">Termék feltöltése</h4>
          </Card.Header>

          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Temék neve</Form.Label>
                    <Form.Control
                      type='text'
                      required
                      placeholder='Név'
                      name='name'
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Ár forintban</Form.Label>
                    <Form.Control
                      type='number'
                      required
                      placeholder='5000'
                      name='priceHUF'
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Alkohol százalék</Form.Label>
                    <Form.Control
                      type='number'
                      required
                      placeholder='0-100'
                      min={0}
                      max={100}
                      name='alcoholPerc'
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Kiszerelés milliliterben</Form.Label>
                    <Form.Control
                      type='number'
                      required
                      placeholder='500'
                      name='contentML'
                    />
                  </Form.Group>
                </Col>


                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Elérhető mennyiség</Form.Label>
                    <Form.Control
                      type='number'
                      required
                      placeholder='50'
                      name='Stock'
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Row className="align-items-start">
                    <Col md={12}>
                      <Form.Group controlId="formFileMultiple" className="mb-3">
                        <Form.Label>Képek</Form.Label>
                        <Form.Control
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mt-3 d-flex flex-wrap gap-2">
                      {previews.map((url, index) => (
                        <div
                          key={url}
                          className="position-relative"
                          onMouseEnter={() => setHoverIndex(index)}
                          onMouseLeave={() => setHoverIndex(null)}
                          style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                          onClick={() => handleRemove(index)}
                        >
                          <Image
                            src={url}
                            thumbnail
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />

                          {hoverIndex === index && (
                            <div
                              className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                              style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '0.25rem' }}
                            >
                              <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>×</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Button type='submit'>Feltöltés</Button>
            </Form>
          </Card.Body>
        </Card>
      </Container >
    </>
  )

}

export default Upload;