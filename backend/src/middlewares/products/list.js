import e from 'express';
import HttpError from '../../models/httpError.js';
export default function listProductsMiddleware(req, res, next) {
    let { page, limit, sortby, sortorder, minprice, maxprice, minstock, maxstock, minalcohol, maxalcohol, mincontent, maxcontent, search } = req.query;
    const parseNum = v => {
        if (v === undefined || v === null || v === '') return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };
    minprice = parseNum(minprice);
    maxprice = parseNum(maxprice);
    minstock = parseNum(minstock);
    maxstock = parseNum(maxstock);
    minalcohol = parseNum(minalcohol);
    maxalcohol = parseNum(maxalcohol);
    mincontent = parseNum(mincontent);
    maxcontent = parseNum(maxcontent);
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
        } else {
            limit = 10;
        }
        if (limit > 30) {
            return next(new HttpError('A limit értéke nem lehet nagyobb 30-nál', 400));
        }
        offset = (page - 1) * limit;
    } else if (limit) {
        limit = Number(limit);
        if (isNaN(limit) || limit < 1) {
            return next(new HttpError('Érvénytelen limit érték', 400));
        }
        if (limit > 30) {
            return next(new HttpError('A limit értéke nem lehet nagyobb 30-nál', 400));
        }
        page = 1;
        offset = 0;
    } else {
        limit = 12;
        page = 1;
        offset = 0;
    }
    req.pagination = { page, limit, offset };
    req.sorting = { sortby, sortorder };
    req.filters = { minprice, maxprice, minstock, maxstock, minalcohol, maxalcohol, mincontent, maxcontent, search };
    next();
}

export async function getProductDetailsMiddleware(req, res, next) {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
        return next(new HttpError('Érvénytelen termék ID', 400));
    }
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
        return next(new HttpError('Érvénytelen termék ID formátum', 400));
    }
    req.productID = parseInt(id, 10);
    next();
}