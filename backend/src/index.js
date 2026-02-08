// #region Imports
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Coloredlog } from '@gerync/utils2';

import config from './config.js';

import routes from './routes/index.js';

// #endregion

// #region Initialization
const app = express();
app.use(cors({
    origin: `https://${config.frontend.host}:${config.frontend.port}`,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// #endregion
// #region Routes

app.use('/api/auth', routes.auth);
app.use('/api/promote', routes.promote);

// #endregion

// #region Server

app.listen(config.backend.port, () => {
    Coloredlog([`API `, `https://${config.backend.host}:${config.backend.port}`, ` - linken érhető el`], ['#00ff00', '#00b8e6', '#00ff00']);
});

// #endregion