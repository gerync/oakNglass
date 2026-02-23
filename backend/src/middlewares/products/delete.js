import HttpError from "../../models/httpError.js";

export default function DeleteProductMiddleware(req, res, next) {
    const id = req.params.id;
    if (id === undefined) {
        return next(new HttpError('Nincs megadva termék azonosító', 400));
    }
    if (!/^[1-9]\d*$/.test(String(id))) {
        return next(new HttpError('Érvénytelen termék azonosító', 400));
    }
    req.params.id = Number(id);
    next();
}