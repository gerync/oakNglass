import { pool } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import { decryptData } from '../../utils/security/encrypt.js';

export async function PostReviewController(req, res, next) {
    const rating = req.body.rating;
    const comment = req.body.comment;
    const blogId = req.params.blogId;
    const userId = req.user.uuid;
    const conn = await pool.connect();
    try {
        await conn.query('BEGIN');
        const blogResult = await conn.query('SELECT blogid FROM blogs WHERE blogid = $1', [blogId]);
        if (blogResult.rows.length === 0) {
            throw new HttpError('Nincs ilyen blog', 404);
        }
        const result = await conn.query('INSERT INTO reviews (rating, comment, blogid, userid) VALUES ($1, $2, $3, $4) RETURNING reviewid AS id, rating, comment, blogid, userid, createdat', [rating, comment, blogId, userId]);
        await conn.query('COMMIT');
        res.json({ review: result.rows[0] });
    }
    catch (err) {
        await conn.query('ROLLBACK');
        next(err);
    }
    finally {
        conn.release();
    }
}

export async function UpdateReviewController(req, res, next) {
    const rating = req.body.rating;
    const comment = req.body.comment;
    const reviewId = req.params.reviewId;
    const userId = req.user.uuid;
    const conn = await pool.connect();
    try {
        await conn.query('BEGIN');
        const reviewResult = await conn.query('SELECT reviewid, userid FROM reviews WHERE reviewid = $1', [reviewId]);
        if (reviewResult.rows.length === 0) {
            throw new HttpError('Nincs ilyen visszajelzés', 404);
        }
        if (reviewResult.rows[0].userid !== userId) {   
            throw new HttpError('Csak a visszajelzés írója módosíthatja a visszajelzést', 403);
        }
        const result = await conn.query('UPDATE reviews SET rating = $1, comment = $2 WHERE reviewid = $3 RETURNING reviewid AS id, rating, comment, blogid, userid, createdat', [rating, comment, reviewId]);
        await conn.query('COMMIT');
        res.json({ review: result.rows[0] });
    }
    catch (err) {
        await conn.query('ROLLBACK');
        next(err);
    }
    finally {
        conn.release();
    }
}

export async function DeleteReviewController(req, res, next) {
    const reviewId = req.params.reviewId;
    const userId = req.user.uuid;
    const conn = await pool.connect();
    try {
        await conn.query('BEGIN');
        const reviewResult = await conn.query('SELECT reviewid, userid FROM reviews WHERE reviewid = $1', [reviewId]);
        if (reviewResult.rows.length === 0) {
            throw new HttpError('Nincs ilyen visszajelzés', 404);
        }
        if (reviewResult.rows[0].userid !== userId) {
            throw new HttpError('Csak a visszajelzés írója törölheti a visszajelzést', 403);
        }
        const result = await conn.query('DELETE FROM reviews WHERE reviewid = $1 RETURNING reviewid AS id, rating, comment, blogid, userid, createdat', [reviewId]);
        await conn.query('COMMIT');
        res.json({ review: result.rows[0] });
    }
    catch (err) {
        await conn.query('ROLLBACK');
        next(err);
    }
    finally {
        conn.release();
    }
}

export async function GetReviewsByProductController(req, res, next) {
    const prodid = req.params.prodid;
    const conn = await pool.connect();
    try {
        const result = await conn.query('SELECT reviewid AS id, rating, comment, blogid, u.fullnameenc, createdat FROM reviews JOIN users u ON reviews.userid = u.userid WHERE blogid = $1 ORDER BY createdat DESC', [prodid]);
        for (const row of result.rows) {
            try {
                row.fullname = decryptData(row.fullnameenc);
            } catch (e) {
                row.fullname = null;
            }
            delete row.fullnameenc;
        }
        res.json({ reviews: result.rows });
    }
    catch (err) {
        next(err);
    }
    finally {
        conn.release();
    }
}

export default {
    PostReviewController,
    UpdateReviewController,
    DeleteReviewController,
    GetReviewsByProductController
};