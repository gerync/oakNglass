import HttpError from "../../models/httpError.js";

export function OrderProductsMiddleware(req, res, next) {
    const products = req.body.products;
    const shipmentAddress = req.body.shipmentAddress;

    if (!shipmentAddress || typeof shipmentAddress !== 'string' || shipmentAddress.trim() === '') {
        return next(new HttpError('A szállítási cím kötelező és nem lehet üres.', 400));
    }
    
    const shipmentAddressPattern = /^[a-zA-Z0-9\s,.-]+$/;
    if (!shipmentAddressPattern.test(shipmentAddress)) {
        return next(new HttpError('A szállítási cím csak érvényes karaktereket tartalmazhat (betűk, számok, szóközök, vesszők, pontok, kötőjelek).', 400));
    }

    const shipmenttrimmed = shipmentAddress.trim();
    if (shipmenttrimmed.length < 10 || shipmenttrimmed.length > 200) {
        return next(new HttpError('A szállítási címnek legalább 10 és legfeljebb 200 karakter hosszúnak kell lennie.', 400));
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new HttpError('A termékek listája kötelező és nem lehet üres.', 400));
    }

    for (const product of products) {
        if (typeof product.productId !== 'number' || product.productId <= 0) {
            return next(new HttpError('Minden terméknek érvényes productId-vel kell rendelkeznie.', 400));
        }
        if (typeof product.quantity !== 'number' || product.quantity <= 0) {
            return next(new HttpError('Minden terméknek érvényes quantity-vel kell rendelkeznie.', 400));
        }
    }
    next();
}

export function GetOrderDetailsMiddleware(req, res, next) {
    const orderId = req.params.id;
    const userId = req.user.id;
    if (!orderId || orderId.length < 16) {
        return next(new HttpError('Érvénytelen rendelés azonosító.', 400));
    }
    next();
}