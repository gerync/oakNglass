import HttpError from '../../models/httpError.js';

export function CreateBlogMiddleware(req, res, next) {
    const title = req.body.title;
    const content = req.body.content;

    if (!title || !content) {
        return next(new HttpError('ím és tartalom megadása kötelező', 400));
    }

    if (Object.keys(req.body).length > 2) {
        return next(new HttpError('Csak a cím és a tartalom adható meg', 400));
    }
    if (title.length < 5 || title.length > 100) {
        return next(new HttpError('A cím hossza 5 és 100 karakter között kell legyen', 400));
    }
    if (content.length < 20 || content.length > 600) {
        return next(new HttpError('A tartalom hossza 20 és 600 karakter között kell legyen', 400));
    }
    next();
}

export function UpdateBlogMiddleware(req, res, next) {
    const title = req.body.title;
    const content = req.body.content;
    const id = req.params.id;

    if (!title || !content) {
        return next(new HttpError('ím és tartalom megadása kötelező', 400));
    }

    if (Object.keys(req.body).length > 2) {
        return next(new HttpError('Csak a cím és a tartalom adható meg', 400));
    }
    if (title.length < 5 || title.length > 100) {
        return next(new HttpError('A cím hossza 5 és 100 karakter között kell legyen', 400));
    }
    if (content.length < 20 || content.length > 600) {
        return next(new HttpError('A tartalom hossza 20 és 600 karakter között kell legyen', 400));
    }
    if (isNaN(id)) {
        return next(new HttpError('Az ID-nek számnak kell lennie', 400));
    }
    next();
}

export function DeleteBlogMiddleware(req, res, next) {
    const id = req.params.id;

    if (isNaN(id)) {
        return next(new HttpError('Az ID-nek számnak kell lennie', 400));
    }
    next();
}

export default { CreateBlogMiddleware, UpdateBlogMiddleware, DeleteBlogMiddleware };