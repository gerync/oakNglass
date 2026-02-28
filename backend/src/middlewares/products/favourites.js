import HttpError from '../../models/httpError.js';

export function addFavouritesMiddleware(req, res, next) {
    const productID = req.params.productid;
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


export function removeFavouritesMiddleware(req, res, next) {
    const productID = req.params.productid;
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

export function getFavouritesMiddleware(req, res, next) {
    const user = req.user;
    if (!user) {
        return next(new HttpError('Felhasználó nem azonosított', 401));
    }
    req.user = user;
    next();
}