import HttpError from '../../models/httpError.js';

export default function PatchProductMiddleware(req, res, next) {
    let { name, alcoholperc, contentml, pricehuf, stock } = req.body;
    let id = req.params.id;

    const nothingProvided = name === undefined && alcoholperc === undefined && contentml === undefined && pricehuf === undefined && stock === undefined;
    if (nothingProvided) {
        return next(new HttpError('Nincs megadva módosítandó mező', 400));
    }

    if (isNaN(id) || parseInt(id, 10) <= 0) {
        return next(new HttpError('Érvénytelen termék azonosító', 400));
    }
    id = parseInt(id, 10);

    if (alcoholperc !== undefined) {
        const parsed = parseFloat(alcoholperc);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            return next(new HttpError('Az alkohol százalék értékének 0 és 100 között kell lennie', 400));
        }
        alcoholperc = parsed;
    }

    if (contentml !== undefined) {
        const parsed = parseInt(contentml, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return next(new HttpError('A tartalom ml értékének pozitív egész számnak kell lennie', 400));
        }
        contentml = parsed;
    }

    if (pricehuf !== undefined) {
        const parsed = parseInt(pricehuf, 10);
        if (isNaN(parsed) || parsed < 0) {
            return next(new HttpError('Az ár értékének nem lehet negatív', 400));
        }
        pricehuf = parsed;
    }

    if (stock !== undefined) {
        const parsed = parseInt(stock, 10);
        if (isNaN(parsed) || parsed < 0) {
            return next(new HttpError('A készlet értékének nem lehet negatív', 400));
        }
        stock = parsed;
    }

    req.body = { name: (name !== undefined ? String(name).trim() : undefined), alcoholperc, contentml, pricehuf, stock, id };
    next();
}