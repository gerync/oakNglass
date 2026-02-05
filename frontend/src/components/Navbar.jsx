import { Navbar, Nav, NavDropdown, Image } from "react-bootstrap";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Home from "../../Home";
import Products from "../../Products";

function NavbarComponent() {
  return (
    <>
      <BrowserRouter>
        <Navbar expand="md" fixed="top" className="custom-navbar">
          <Navbar.Brand className="brand"><Image src="src/assets/Logo.svg" height='50px'/></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            <Nav>
              <Nav.Link className="nav-link-custom" as={NavLink} to='/'>Kezdőlap</Nav.Link>
              <Nav.Link className="nav-link-custom" as={NavLink} to='/shop'>Termékek</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Link className="nav-link-custom">Bejelentkezés</Nav.Link>

              <NavDropdown
                title="Fiók"
                id="basic-nav-dropdown"
                className="nav-dropdown-custom "
                drop="start"
              >
                <NavDropdown.Item>Rendelések</NavDropdown.Item>
                <NavDropdown.Item >Kijelentkezés</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Routes>
          <Route path="/" exact activeClassName="active" element={<Home/>}/>
          <Route path="/shop" exact activeClassName="active" element={<Products/>}/>
        </Routes>
      </BrowserRouter>

    </>
  )

}

export default NavbarComponent;