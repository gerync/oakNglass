import { pool } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import { decryptData } from '../../utils/security/encrypt.js';

export async function CreateBlogController(req, res, next) {
    const title = req.body.title;
    const content = req.body.content;
    const conn = await pool.connect();
    const userid = req.user.uuid;
    try {
        await conn.query('BEGIN');
        const isJournalist = await conn.query('SELECT role FROM users WHERE uuid = $1', [userid]);

        if (isJournalist.rows[0].role.toLowerCase() !== 'journalist') {
            throw new HttpError('Csak újságírók hozhatnak létre blogot', 403);
        }
        const result = await conn.query('INSERT INTO blogs (title, content, journalistuuid) VALUES ($1, $2, $3) RETURNING blogid AS id, title, content, journalistuuid, createdat', [title, content, userid]);
        await conn.query('COMMIT');
        res.status(201).json({ blog: result.rows[0] });
    }
    catch (err) {
        await conn.query('ROLLBACK');
        next(err);
    }
    finally {
        conn.release();
    }
}

export async function ListBlogsController(req, res, next) {
    const conn = await pool.connect();
    try {
        const result = await conn.query('SELECT b.blogid AS id, b.title, b.content, u.fullnameenc AS journalistEncrypted FROM blogs b JOIN users u ON b.journalistuuid = u.uuid');
        for (const row of result.rows) {
            row.journalist = decryptData(row.journalistEncrypted);
            delete row.journalistEncrypted;
        }
        res.json({ blogs: result.rows });
    }
    catch (err) {
        next(err);
    }
    finally {
        conn.release();
    }
}

export async function UpdateBlogController(req, res, next) {
    const title = req.body.title;
    const content = req.body.content;
    const id = req.params.id;
    const conn = await pool.connect();
    const userid = req.user.uuid;
    try {
        await conn.query('BEGIN');
        const isJournalist = await conn.query('SELECT journalistuuid FROM blogs WHERE blogid = $1', [id]);

        if (isJournalist.rows.length === 0) {
            throw new HttpError('Nincs ilyen blog', 404);
        }
        if (isJournalist.rows[0].journalistuuid !== userid) {
            throw new HttpError('Csak a blog írója módosíthatja a blogot', 403);
        }
        const result = await conn.query('UPDATE blogs SET title = $1, content = $2 WHERE blogid = $3 RETURNING blogid AS id, title, content, journalistuuid, createdat', [title, content, id]);
        await conn.query('COMMIT');
        res.json({ blog: result.rows[0] });
    }
    catch (err) {
        await conn.query('ROLLBACK');
        next(err);
    }
    finally {
        conn.release();
    }
}

export async function DeleteBlogController(req, res, next) {
    const id = req.params.id;
    const conn = await pool.connect();
    const userid = req.user.uuid;
    try {
        await conn.query('BEGIN');
        const isJournalist = await conn.query('SELECT journalistuuid FROM blogs WHERE blogid = $1', [id]);
        
        if (isJournalist.rows.length === 0) {
            throw new HttpError('Nincs ilyen blog', 404);
        }
        if (isJournalist.rows[0].journalistuuid !== userid) {
            throw new HttpError('Csak a blog írója törölheti a blogot', 403);
        }
        const result = await conn.query('DELETE FROM blogs WHERE blogid = $1 RETURNING blogid AS id, title, content, journalistuuid, createdat', [id]);
        await conn.query('COMMIT');
        res.json({ blog: result.rows[0] });
    }
    catch (err) {
        await conn.query('ROLLBACK');
        next(err);
    }
    finally {
        conn.release();
    }
}

export default { CreateBlogController, ListBlogsController, UpdateBlogController, DeleteBlogController };