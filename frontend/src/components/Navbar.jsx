import { Navbar, Nav, NavDropdown, Image, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import '../style/Navbar.css';

import  PasswordResetModal from '../components/PasswordResetModal';
import LogRegModal from '../components/LogReg';
import logo from '../assets/LogoBlack.svg';
import moon from '../assets/moon.svg';
import sun from '../assets/sun.svg';

import MetallicPaint from "../style/metallicpaint/MetallicPaint";

import { useContext, useState } from "react";
import { GlobalContext, CartContext } from "../contexts/Contexts";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-toastify";


function NavbarComponent() {
  const { isLoggedIn, isAdmin, toggleTheme, isLight, logoutHandler } = useContext(GlobalContext);
  const [showLogReg, setShowLogReg] = useState(false);
  const { cartCount } = useContext(CartContext);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const toggleLogReg = () => {
    setShowLogReg((prev) => !prev);
  };

  const toggleShowPasswordReset = () => {
    setShowPasswordReset((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (res.ok) {
        logoutHandler();
        toast.success('Sikeres kijelentkezés.');

      } else {
        toast.error('Hiba történt.')
      }
    } catch (error) {
      toast.error('Hiba történt.');
      console.error(error)
    }
  }


  return (
    <>
      <LogRegModal show={showLogReg} setShow={toggleLogReg} toggleShowPasswordReset={toggleShowPasswordReset} />
      <PasswordResetModal show={showPasswordReset} setShow={toggleShowPasswordReset} />
      <Navbar expand="md" fixed="top" className="custom-navbar">
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggle ms-auto" />
        <Navbar.Collapse className="nav-inner">
          <Navbar.Brand as={NavLink} to='/' className="brand">
            <div style={{ height: '50px', width: 'auto' }}>
              <MetallicPaint
                imageSrc={logo}
                // Pattern
                seed={42}
                scale={4}
                patternSharpness={1}
                noiseScale={0.5}
                // Animation
                speed={0.15}
                liquid={0.75}
                mouseAnimation={false}
                // Visual
                brightness={2}
                contrast={0.5}
                refraction={0.01}
                blur={0.015}
                chromaticSpread={2}
                fresnel={1}
                angle={15}
                waveAmplitude={1}
                distortion={1}
                contour={0.2}
                // Colors
                lightColor="#bb2b2b"
                darkColor="#4f0000"
                tintColor="#ff0000"
              />
            </div>



          </Navbar.Brand>
          <Nav>
            <Nav.Link className="nav-link-custom" as={NavLink} to='/'>Kezdőlap</Nav.Link>
            <Nav.Link className="nav-link-custom" as={NavLink} to='/termekek'>Termékek</Nav.Link>
            <Nav.Link className="nav-link-custom" as={NavLink} to='/rolunk'>Rólunk</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {!isLoggedIn && (
              <Nav.Link className="nav-link-custom" onClick={() => toggleLogReg()}>Bejelentkezés</Nav.Link>
            )}

            {isLoggedIn && isAdmin && (
              <NavDropdown
                title="Admin"
                id="basic-nav-dropdown"
                className="nav-dropdown-custom "
                drop="start"
              >
                <NavDropdown.Item as={NavLink} to='/feltoltes'>Termék feltöltés</NavDropdown.Item>
              </NavDropdown>
            )}
            {isLoggedIn && (
              < NavDropdown
                title="Fiók"
                id="basic-nav-dropdown"
                className="nav-dropdown-custom "
                drop="start"
              >
                <NavDropdown.Item as={NavLink} to='/kosar'>Kosár ({cartCount})</NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to='/rendelesek'>Rendelések</NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout} >Kijelentkezés</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Button onClick={toggleTheme} className="btn-theme">
            {isLight ? (
              <Image src={moon} height='30px' />
            ) : (
              <Image src={sun} height='30px' ></Image>
            )}

          </Button>
        </Navbar.Collapse>
      </Navbar >
    </>
  )

}

export default NavbarComponent;
