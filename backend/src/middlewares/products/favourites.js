import HttpError from '../../models/httpError.js';

export function addFavouritesMiddleware(req, res, next) {
    const productID = req.params.productID;
    const user = req.user;

    if (!productID) {
        return next(new HttpError('Termékazonosító hiányzik', 400));
    }
    if (!user) {
        return next(new HttpError('Felhasználó nem azonosított', 401));
    }
    
    req.productID = productID;
    req.user = user;
    next();
}