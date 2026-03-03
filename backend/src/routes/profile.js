import getProfile from "../controllers/auth/profile.js";
import express from 'express';
import protect from '../middlewares/general/protect.js';

const router = express.Router();

router.get('/profile', protect, getProfile);

export default router;