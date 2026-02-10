import HttpError from '../../models/httpError.js';

export default function ResetPassMiddleware(req, res, next) {
    let email = req.body.email;
    let mobile = req.body.mobile;

    const uriemail = req.query.email;
    const code = req.query.code;
    const newPassword = req.body.newPassword;
    if (!email && !mobile && !(uriemail && code && newPassword)) {
        throw new HttpError('Érvénytelen kérés', 400);
    }
    if (email || mobile) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^\d{10}$/;

        email = email ? email.trim() : null;
        mobile = mobile ? mobile.trim() : null;

        if (email && !emailRegex.test(email)) throw new HttpError('Érvénytelen email cím', 400);
        if (mobile && !mobileRegex.test(mobile)) throw new HttpError('Érvénytelen telefonszám', 400);
        next();
    }
    else if (uriemail && code && newPassword) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = {
            length: /^.{8,}$/,
            lowercase: /[a-z]/,
            uppercase: /[A-Z]/,
            digit: /[0-9]/,
            special: /[!@#$%^&*(),.?":{}|<>]/
        };
        if (!passwordRegex.length.test(newPassword)) throw new HttpError('A jelszónak legalább 8 karakter hosszúnak kell lennie', 400);
        if (!passwordRegex.lowercase.test(newPassword)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy kisbetűt', 400);
        if (!passwordRegex.uppercase.test(newPassword)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy nagybetűt', 400);
        if (!passwordRegex.digit.test(newPassword)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy számjegyet', 400);
        if (!passwordRegex.special.test(newPassword)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy speciális karaktert', 400);
        
        let decodedEmail;
        try {
            decodedEmail = decodeURIComponent(uriemail);
        }
        catch (e) {
            throw new HttpError('Érvénytelen link', 400);
        }
        if (!emailRegex.test(decodedEmail)) throw new HttpError('Érvénytelen link', 400);
        const codeRegex = /^\d{6}$/;
        if (!codeRegex.test(code)) throw new HttpError('Érvénytelen link', 400);
        req.email = decodedEmail;
        req.code = code;
        req.newPassword = newPassword;
        next();
    }
}