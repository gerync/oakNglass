import HttpError from '../../models/httpError.js';
export default async function listProductsMiddleware(req, res, next) {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;
    if (page < 1) {
        return next(new HttpError('A page nem lehet kisebb 1-nél', 400));
    }
    if (limit < 1) {
        return next(new HttpError('A limit nem lehet kisebb 1-nél', 400));
    }
    if (limit > 24) {
        return next(new HttpError('A limit nem lehet nagyobb 24-nél', 400));
    }
    req.pagination = { limit, offset, page };
    next();
}