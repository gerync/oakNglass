import { Card, Container, Button, Form } from 'react-bootstrap';
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-toastify';

function NewBlog() {

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      title: e.target.title.value,
      content: e.target.content.value
    }

    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.BLOGS.POST}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Sikeres feltöltés!');

        e.target.title.value = '';
        e.target.content.value = '';

      } else {
        if (res.status == 401) toast.error('Nincs jogosultsága a művelethez!');
      }
    } catch {
      toast.error('Hiba történt feltöltés során!');
    }
  }



  return (
    <Container className="my-5">
      <Card className="shadow-sm border-0 bg-content">
        <Card.Header className="bg-content py-3">
          <h4 className="mb-0">Új blog hozzáadása</h4>
        </Card.Header>

        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="blogTitle">
              <Form.Label className="fw-bold">Blog címe</Form.Label>
              <Form.Control
                type="text"
                placeholder="Adja meg a címet..."
                name='title'
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="blogContent">
              <Form.Label className="fw-bold">Tartalom</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                placeholder="Írja ide a bejegyzést..."
                name='content'
                required
              />
            </Form.Group>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button variant="primary" type="submit" className="px-5">
                Közzététel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default NewBlog;