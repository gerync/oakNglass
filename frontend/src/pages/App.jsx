import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Home from "../pages/Home";
import Products from "../pages/Products";
import AboutUs from '../pages/AboutUs';
import { useContext } from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { Spinner } from 'react-bootstrap';


function App() {
  const { isCookieLoaded } = useContext(GlobalContext)

  if (!isCookieLoaded) return (
    <Spinner animation='border' />
  )
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <BrowserRouter expand="md" fixed="top" className="custom-navbar nav-inner">
        <Navbar />

        <Routes>
          <Route path="/" exact activeClassName="active" element={<Home />} />
          <Route path="/termekek" exact activeClassName="active" element={<Products />} />
          <Route path="/rolunk" exact activeClassName="active" element={<AboutUs />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
