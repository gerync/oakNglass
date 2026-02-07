import HttpError from "../../models/httpError.js";

export default function LoginMiddleware(req, res, next) {
    const identifier = req.body.identifier;
    const password = req.body.password;

    if (!identifier || !password) {
        throw new HttpError('Hiányzó azonosító vagy jelszó', 400);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^\+?[1-9]\d{1,14}$/;
    
    if (!emailPattern.test(identifier) && !mobilePattern.test(identifier)) {
        throw new HttpError('Az azonosító érvénytelen formátumú', 400);
    }
    next();
}