import { UserError } from '@gerync/utils2';

export default function LoginAuthMiddleware(req, res, next) {
    const body = req.body;
    if (!body.email && !body.mobile) {
        throw new UserError('Hiányzó email vagy mobil szám!', 400);
    }
    if (!body.password) {
        throw new UserError('Hiányzó jelszó!', 400);
    }
    if (body.keepMe !== undefined ) {
        if (typeof body.keepMe !== 'boolean') {
            body.keepMe = body.keepMe === 'true';
        }
    }
    else {
        body.keepMe = false;
    }
    req.body.identifier = body.email ? body.email : body.mobile;
    next();
}