import HttpError from '../../models/httpError.js';
export default function VerifyAccountMiddleware(req, res, next) {
    const urlCode = req.query.code;
    const urlUriEncodedEmail = req.query.email;

    const typedCode = req.body.code;
    if ( (!urlCode || !urlUriEncodedEmail) && !typedCode) {
        throw new HttpError('Hibás kérés', 400);
    }

    const email = decodeURIComponent(urlUriEncodedEmail);
    if (typedCode) {
        req.verification = { code: typedCode };
    } else {
        req.verification = { code: urlCode, email };
    }
    next();
}