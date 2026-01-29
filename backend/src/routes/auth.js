import registerController from "../controllers/auth/register.js";
import registerMiddleware from "../middlewares/auth/registerMiddleware.js";

import express from "express";

const router = express.Router();

router.post("/register", registerMiddleware, registerController);

export default router;