import { pool } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';

export default async function PatchProductController(req, res, next) {
    let { name, alcoholperc, contentml, pricehuf, stock, id } = req.body;

    const conn = await pool.connect();
    try {
            await conn.query('BEGIN');
            const query = `UPDATE products p
            SET name = COALESCE($2, p.name),
                alcoholpercent = COALESCE($3, p.alcoholpercent),
                contentml = COALESCE($4, p.contentml),
                pricehuf = COALESCE($5, p.pricehuf),
                stock = COALESCE($6, p.stock)
            WHERE p.prodid = $1
            RETURNING *;`;
        const values = [id, name, alcoholperc, contentml, pricehuf, stock];
            const result = await conn.query(query, values);
        if (result.rowCount === 0) {
            await conn.query('ROLLBACK');
            return next(new HttpError('Nincs ilyen azonosítójú termék', 404));
        }
        await conn.query('COMMIT');
        res.json({ message: 'Termék sikeresen módosítva', product: result.rows[0] });
    } catch (err) {
            try { await conn.query('ROLLBACK'); } catch (e) {}
            next(err);
    }
    finally {
        conn.release();
    }
}