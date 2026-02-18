import express from 'express';

import { AddfavouritesController, RemovefavouritesController, GetfavouritesController } from '../controllers/products/favourites.js';
import { addFavouritesMiddleware, removeFavouritesMiddleware, getFavouritesMiddleware } from '../middlewares/products/favourites.js';

import ProtectMiddleware from '../middlewares/general/protect.js';

const router = express.Router();

router.post('/:productID', ProtectMiddleware, addFavouritesMiddleware, AddfavouritesController);
router.delete('/:productID', ProtectMiddleware, removeFavouritesMiddleware, RemovefavouritesController);
router.get('/', ProtectMiddleware, getFavouritesMiddleware, GetfavouritesController);

export default router;