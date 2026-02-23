import authroutes from './auth.js';
import promoteRoutes from './promote.js';
import products from './products.js';
import fauvourites from './favourites.js';
import order from './order.js';
import { blogrouter } from './blogs-reviews.js';

export default {
    auth: authroutes,
    promote: promoteRoutes,
    products: products,
    favourites: fauvourites,
    order: order,
    blogs: blogrouter
}