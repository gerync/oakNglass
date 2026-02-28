import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Home from "../pages/Home";
import Products from "../pages/Products";
import AboutUs from '../pages/AboutUs';
import Cart from './Cart';
import Orders from './Orders';
import VerifyEmail from './VerifyEmail';
import ResetPassword from './ResetPassword';
import Profil from './Profil';
import Favourites from './Favourites'


import { useContext } from 'react';
import { GlobalContext } from '../contexts/Contexts';


function App() {
  const { isLoggedIn, isAdmin } = useContext(GlobalContext);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
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
          <Route path="/profil" exact activeClassName="active" element={isLoggedIn ? (<Profil />) : (<Home />)} />
          <Route path="/kedvenc" exact activeClassName="active" element={isLoggedIn ? (<Favourites />) : (<Home />)} />
          <Route path="/kosar" exact activeClassName="active" element={isLoggedIn ? (<Cart />) : (<Home />)} />
          <Route path="/rendelesek" exact activeClassName="active" element={isLoggedIn ? (<Orders />) : (<Home />)} />
          <Route path="/verify-email" exact element={<VerifyEmail />} />
          <Route path="/reset-password" exact element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App