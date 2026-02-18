import { pool } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';

export default async function DeleteProductController(req, res, next) {
    const id = req.params.id;
    const conn = await pool.connect();
    try {
        await conn.query('BEGIN');
        const result = await conn.query('DELETE FROM products WHERE id = $1 RETURNING *;', [id]);
        if (result.rowCount === 0) {
            await conn.query('ROLLBACK');
            return next(new HttpError('Nincs ilyen azonosítójú termék', 404));
        }
        await conn.query('COMMIT');
        res.json({ message: 'Termék sikeresen törölve', product: result.rows[0] });
    } catch (err) {
        try { await conn.query('ROLLBACK'); } catch (e) {}
        next(err);
    } finally {
        conn.release();
    }
}