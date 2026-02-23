import HttpError from "../../models/httpError.js";

export function PostReviewMiddleware(req, res, next) {
    let rating = req.body.rating;
    let comment = req.body.comment;
    let blogId = req.params.blogId;

    if (typeof rating !== 'number') rating = parseInt(rating);
    if (isNaN(parseInt(blogId))) {
        throw new HttpError('A blog azonosítójának egy számnak kell lennie', 400);
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new HttpError('Az értékelésnek egy 1 és 5 közötti számnak kell lennie', 400);
    }
    if (typeof comment !== 'string' || comment.trim() === '') {
        throw new HttpError('A visszajelzésnek tartalmaznia kell egy megjegyzést', 400);
    }
    next();
}

export function UpdateReviewMiddleware(req, res, next) {
    let rating = req.body.rating;
    let comment = req.body.comment;
    let reviewId = req.params.reviewId;
    if (isNaN(parseInt(reviewId))) {
        throw new HttpError('A visszajelzés azonosítójának egy számnak kell lennie', 400);
    }
    if (typeof rating !== 'number') rating = parseInt(rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new HttpError('Az értékelésnek egy 1 és 5 közötti számnak kell lennie', 400);
    }
    if (typeof comment !== 'string' || comment.trim() === '') {
        throw new HttpError('A visszajelzésnek tartalmaznia kell egy megjegyzést', 400);
    }
    next();
}

export function DeleteReviewMiddleware(req, res, next) {
    let reviewId = req.params.reviewId;
    if (isNaN(parseInt(reviewId))) {
        throw new HttpError('A visszajelzés azonosítójának egy számnak kell lennie', 400);
    }
    next();
}

export function GetReviewsMiddleware(req, res, next) {
    let prodid = req.params.prodid;
    if (isNaN(parseInt(prodid))) {
        throw new HttpError('A termék azonosítójának egy számnak kell lennie', 400);
    }
    next();
}

export default {
    PostReviewMiddleware,
    UpdateReviewMiddleware,
    DeleteReviewMiddleware,
    GetReviewsMiddleware
};