import express from 'express';

import CreateProductController from '../controllers/products/create.js';
import CreateProductMiddleware from '../middlewares/products/create.js';

import ListProductsController from '../controllers/products/list.js';
import ListProductsMiddleware from '../middlewares/products/list.js';

import PatchProductController from '../controllers/products/patch.js';
import PatchProductMiddleware from '../middlewares/products/patch.js';

import DeleteProductController from '../controllers/products/delete.js';
import DeleteProductMiddleware from '../middlewares/products/delete.js';

import protect, { isAdmin } from '../middlewares/general/protect.js';

const router = express.Router();

router.get('/', ListProductsMiddleware, ListProductsController);
router.post('/',[protect, isAdmin, CreateProductMiddleware], CreateProductController);
router.patch('/:id', [protect, isAdmin, PatchProductMiddleware], PatchProductController);
router.delete('/:id', [protect, isAdmin, DeleteProductMiddleware], DeleteProductController);

export default router;