import HttpError from '../../models/httpError.js';
export default async function listProductsMiddleware(req, res, next) {
    let { page, limit, sortby, sortorder, minprice, maxprice, minstock, maxstock, minalcohol, maxalcohol, mincontent, maxcontent, search } = req.query;
    if (sortby) {
        const validsortby = ['alphabetical', 'price', 'newest', 'alcoholperc', 'contentml', 'stock'];
        if (!validsortby.includes(sortby.toLowerCase())) {
            return next(new HttpError('Érvénytelen sortby érték', 400));
        }
        switch (sortby.toLowerCase()) {
            case 'alphabetical':
                sortby = 'name';
                break;
            case 'price':
                sortby = 'pricehuf';
                break;
            case 'newest':
                sortby = 'createdat';
                break;
            case 'alcoholperc':
                sortby = 'alcoholpercent';
                break;
            case 'contentml':
                sortby = 'contentml';
                break;
            case 'stock':
                sortby = 'stock';
                break;
        }
    } else {
        sortby = 'createdat';
    }
    if (sortorder) {
        const validsortorder = ['asc', 'desc'];
        if (!validsortorder.includes(sortorder.toLowerCase())) {
            return next(new HttpError('Érvénytelen sortorder érték', 400));
        }
        sortorder = sortorder.toUpperCase();
    } else {
        sortorder = 'DESC';
    }
    let offset = 0;
    if (page) {
        page = Number(page);
        if (isNaN(page) || page < 1) {
            return next(new HttpError('Érvénytelen page érték', 400));
        }
        if (limit) {
            limit = Number(limit);
            if (isNaN(limit) || limit < 1) {
                return next(new HttpError('Érvénytelen limit érték', 400));
            }
            if (limit > 30) {
                return next(new HttpError('A limit értéke nem lehet nagyobb 30-nál', 400));
            }
            offset = (page - 1) * limit;
        } else {
            offset = (page - 1) * 10;
        }
    } else if (limit) {
        limit = Number(limit);
        if (isNaN(limit) || limit < 1) {
            return next(new HttpError('Érvénytelen limit érték', 400));
        }
        if (limit > 30) {
            return next(new HttpError('A limit értéke nem lehet nagyobb 30-nál', 400));
        }
        page = 1;
    } else {
        limit = 12;
        page = 1;
    }
    req.pagination = { page, limit, offset};
    req.sorting = { sortby, sortorder };
    req.filters = { minprice, maxprice, minstock, maxstock, minalcohol, maxalcohol, mincontent, maxcontent };
    req.search = search;
    next();
}