import HttpError from "../../models/httpError.js";
import { pool } from "../../db/pool.js";

export async function AddfavouritesController(req, res) {
    const productID = req.productID;
    const userID = req.user.id;
    const conn = await pool.connection();
    try {
        conn.query('BEGIN');
        const results = await conn.query(`INSERT INTO favourites (userid, prodid)
            VALUES ($1, $2) RETURNING id`, [userID, productID]);
        if (results.rowCount === 0) {
            throw new HttpError('Nem sikerült hozzáadni a kedvencekhez', 500);
        }
        conn.query('COMMIT');
        res.status(201).json({ message: 'Termék hozzáadva a kedvencekhez', favouriteID: results.rows[0].id });
    }
    catch (err) {
        try { await conn.query('ROLLBACK'); } catch (e) {}
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Ez a termék már a kedvencek között van' });
        }
        res.status(500).json({ message: 'Hiba történt a kedvencekhez adás során' });
    }
    finally {
        conn.release();
    }
}