import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Home from "../pages/Home";
import Products from "../pages/Products";
import AboutUs from '../pages/AboutUs';
import Cart from './Cart';
import Orders from './Orders';


function App() {

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
          <Route path="/kosar" exact activeClassName="active" element={<Cart />} />
          <Route path="/rendelesek" exact activeClassName="active" element={<Orders />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
