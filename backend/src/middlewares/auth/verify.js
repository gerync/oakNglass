import { UserError } from '@gerync/utils2';

export default async function verifyEmailMiddleware(req, res, next) {
    let code = req.body.code;
    if (code === undefined || code === null || code === '' || (typeof code !== 'string' && typeof code !== 'number') || typeof code === 'undefined') {
        code = req.query.code;
    }
    if (!code) {
        throw new UserError('A kód megadása kötelező.', 400);
    }
    code = parseInt(code)
    if (typeof code !== 'number' || code.length !== 6 || !/^\d{6}$/.test(code)) {
        throw new UserError('A kód érvénytelen formátumú.', 400);
    }
    req.code = code;
    next();
}