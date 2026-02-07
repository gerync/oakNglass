import registerMiddleware from '../middlewares/auth/register.js';
import registerController from '../controllers/auth/register.js';

import loginMiddleware from '../middlewares/auth/login.js';
import loginController from '../controllers/auth/login.js';

import logoutController from '../controllers/auth/logout.js';
import protect from '../middlewares/general/protect.js';

import verifyMiddleware from '../middlewares/auth/verify.js';
import verifyController from '../controllers/auth/verify.js';

import express from 'express';


const router = express.Router();

router.post('/register', registerMiddleware, registerController);
router.post('/login', loginMiddleware, loginController);
router.post('/logout',  protect, logoutController);
router.post('/verify', verifyMiddleware, verifyController);


export default router;