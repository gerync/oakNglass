import { Navbar, Nav, NavDropdown, Image, Button } from "react-bootstrap";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import '../style/Navbar.css';

import Home from "../pages/Home";
import Products from "../pages/Products";
import AboutUs from '../pages/AboutUs';
import LogRegModal from '../components/LogReg';

import { useContext, useState } from "react";
import { GlobalContext } from "../contexts/GlobalContext";


function NavbarComponent() {
  const { user } = useContext(GlobalContext);
  const [showLogReg, setShowLogReg] = useState(false);

  const [isLight, setIsLight] = useState(() => {
    const savedTheme = localStorage.getItem('user-theme');

    if (savedTheme) {
      document.documentElement.style.colorScheme = savedTheme;
      return savedTheme === 'light';
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';

    document.documentElement.style.colorScheme = initialTheme;
    return !prefersDark;
  });

  const toggleLogReg = () => {
    setShowLogReg((prev) => !prev);
  };

  const toggleTheme = () => {
    const newIsLight = !isLight;
    const newTheme = newIsLight ? 'light' : 'dark';

    setIsLight(newIsLight);
    document.documentElement.style.colorScheme = newTheme;
    localStorage.setItem('user-theme', newTheme);
  };


  return (
    <>
      <LogRegModal show={showLogReg} setShow={toggleLogReg} />
      <BrowserRouter expand="md" fixed="top" className="custom-navbar nav-inner">
        <Navbar expand="md" fixed="top" className="custom-navbar">
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggle ms-auto" />
          <Navbar.Collapse className="nav-inner">
            <Navbar.Brand as={NavLink} to='/' className="brand"><Image src="src/assets/Logo.svg" height='50px' /></Navbar.Brand>
            <Nav>
              <Nav.Link className="nav-link-custom" as={NavLink} to='/'>Kezdőlap</Nav.Link>
              <Nav.Link className="nav-link-custom" as={NavLink} to='/termekek'>Termékek</Nav.Link>
              <Nav.Link className="nav-link-custom" as={NavLink} to='/rolunk'>Rólunk</Nav.Link>
              {showLogReg}
            </Nav>
            <Nav className="ms-auto">
              {
                !user ? (
                  <Nav.Link className="nav-link-custom" onClick={() => toggleLogReg()}>Bejelentkezés</Nav.Link>
                ) : null
              }

              {
                user ? (
                  <NavDropdown
                    title="Fiók"
                    id="basic-nav-dropdown"
                    className="nav-dropdown-custom "
                    drop="start"
                  >
                    <NavDropdown.Item>Rendelések</NavDropdown.Item>
                    <NavDropdown.Item >Kijelentkezés</NavDropdown.Item>
                  </NavDropdown>
                ) : null
              }
            </Nav>
            <Button onClick={toggleTheme} className="btn-theme">
              <Image src={isLight ? "src/assets/moon.svg" : "src/assets/sun.svg"} height='30px' />
            </Button>
          </Navbar.Collapse>
        </Navbar>

        <Routes>
          <Route path="/" exact activeClassName="active" element={<Home />} />
          <Route path="/termekek" exact activeClassName="active" element={<Products />} />
          <Route path="/rolunk" exact activeClassName="active" element={<AboutUs />} />
        </Routes>
      </BrowserRouter>
    </>
  )

}

export default NavbarComponent;