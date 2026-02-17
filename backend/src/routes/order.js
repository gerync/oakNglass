import express from 'express';

import { OrderProductsController, GetOrderDetails, GetMyOrders } from '../controllers/products/order.js';
import {OrderProductsMiddleware, GetOrderDetailsMiddleware} from '../middlewares/products/order.js';

import protect from '../middlewares/general/protect.js';

const router = express.Router();

router.post('/', [protect, OrderProductsMiddleware], OrderProductsController);
router.get('/my-orders', protect, GetMyOrders);
router.get('/:id', [protect, GetOrderDetailsMiddleware], GetOrderDetails);

export default router;