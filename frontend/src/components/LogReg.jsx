import { Modal } from 'react-bootstrap'
import '../style/LogReg.css'

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useState } from 'react';

function LogRegModal({ show, setShow }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Modal show={show} onHide={() => { setShow(); setIsLogin(true) }} centered className='logreg-modal'>

      <Modal.Header closeButton className="border-0">
        <div className="switch-container">
          <div className="nav-pill-wrapper">
            <div className={`sliding-pill ${isLogin ? 'left' : 'right'}`}></div>
            <button className={`nav-pill-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Bejelentkezés</button>
            <button className={`nav-pill-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Regisztráció</button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='overflow-hidden'>
        <div className={`form-slider ${isLogin ? 'show-login' : 'show-register'}`}>
          <div className='form-pane'>
            <LoginForm setShow={setShow}/>
          </div>
          <div className='form-pane'>
            <RegisterForm setShow={setShow} setIsLogin={setIsLogin}/>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
export default LogRegModal;