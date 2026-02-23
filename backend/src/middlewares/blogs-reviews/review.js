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