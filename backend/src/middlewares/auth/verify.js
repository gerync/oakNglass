import HttpError from '../../models/httpError.js';
export default function VerifyAccountMiddleware(req, res, next) {
    const urlCode = req.query.code;
    const urlUriEncodedEmail = req.query.email;

    const typedCode = req.body.code;
    if ((!urlCode || !urlUriEncodedEmail) && !typedCode) {
        throw new HttpError('Hibás kérés', 400);
    }

    if (typedCode) {
        const email = urlUriEncodedEmail ? decodeURIComponent(urlUriEncodedEmail) : null;
        req.verification = { code: typedCode, email };
    } else {
        const email = decodeURIComponent(urlUriEncodedEmail);
        req.verification = { code: urlCode, email };
    }
    next();
}