import HttpError from '../../models/httpError.js';
export default function PromotetMiddleware(req, res, next) {
    const urlCode = req.query.code;
    const urlUriEncodedEmail = req.query.email;

    if (!urlCode || !urlUriEncodedEmail) {
        throw new HttpError('Hibás kérés', 400);
    }
    const email = decodeURIComponent(urlUriEncodedEmail);
    req.verification = { code: urlCode, email };
    next();
}