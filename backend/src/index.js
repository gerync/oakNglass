// #region Imports
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from './config.js';

// #endregion

// #region Initialization
const app = express();
app.use(cors({
    origin: `http://${config.frontend.host}:${config.frontend.port}`,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// #endregion
// #region Routes