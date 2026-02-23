// #region Imports
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Coloredlog } from '@gerync/utils2';

import config from './config.js';

import routes from './routes/index.js';
import ErrorHandlerMiddleware from './middlewares/general/error.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// #endregion

// #region Initialization
const app = express();
// Configure CORS to allow the configured frontend domain and common dev origins
const allowedOrigins = [
    config.frontend.domain(),
    // include frontend domain with explicit dev port if present
    `${config.frontend.domain()}:${config.frontend.port}`,
    'http://localhost:5173',
    'https://localhost:5173'
];
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl, same-origin)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// #endregion
// #region Routes

app.use('/api/auth', routes.auth);
app.use('/api/promote', routes.promote);
app.use('/api/products', routes.products);
app.use('/api/favourites', routes.favourites);
app.use('/api/order', routes.order);
app.use('/api/blogs', routes.blogs);

app.get('/api/health', (req, res) => {
    return res.status(200).json({ status: 'ok' });
});

// Serve API docs
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/api-docs.json', (req, res) => res.json(swaggerSpec));

// #endregion

// #region Server

app.listen(config.backend.port, () => {
    Coloredlog([`API `, `https://${config.backend.host}:${config.backend.port}`, ` - linken érhető el`], ['#00ff00', '#00b8e6', '#00ff00']);
});

// #endregion
// #region Error handling

app.use(ErrorHandlerMiddleware);

// #endregion