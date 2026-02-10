import express from 'express';

import CreateProductController from '../controllers/products/create.js';
import CreateProductMiddleware from '../middlewares/products/create.js';
import ListProductsController from '../controllers/products/list.js';
import ListProductsMiddleware from '../middlewares/products/list.js';

import protect, { isAdmin } from '../middlewares/general/protect.js';

const router = express.Router();

router.get('/', ListProductsMiddleware, ListProductsController);
router.post('/',[protect, isAdmin, CreateProductMiddleware], CreateProductController);

export default router;