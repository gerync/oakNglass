import HttpError from "../../models/httpError.js";
import { pool } from "../../db/pool.js";
import config from "../../config.js";

export async function AddfavouritesController(req, res) {
    const productID = req.productID;
    const userID = req.user.uuid;
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

export async function RemovefavouritesController(req, res) {
    const productID = req.productID;
    const userID = req.user.uuid;
    const conn = await pool.connection();
    try {
        conn.query('BEGIN');
        const results = await conn.query(`DELETE FROM favourites WHERE userid = $1 AND prodid = $2`, [userID, productID]);
        if (results.rowCount === 0) {
            throw new HttpError('Nem sikerült eltávolítani a kedvencek közül', 404);
        }
        conn.query('COMMIT');
        res.status(200).json({ message: 'Termék eltávolítva a kedvencek közül' });
    }
    catch (err) {
        try { await conn.query('ROLLBACK'); } catch (e) {}
        res.status(500).json({ message: 'Hiba történt a kedvencek közül eltávolítás során' });
    }
    finally {
        conn.release();
    }
}

export async function GetfavouritesController(req, res) {
    const userID = req.user.uuid;
    const conn = await pool.connection();
    try {
        const results = await conn.query(`SELECT p.id AS product_id, p.name, p.price,
            COALESCE(array_agg(pi.id) FILTER (WHERE pi.id IS NOT NULL), ARRAY[]::uuid[]) AS image_ids
            FROM favourites f
            JOIN products p ON f.prodid = p.id
            LEFT JOIN productimages pi ON p.id = pi.prodid
            WHERE f.userid = $1
            GROUP BY p.id`, [userID]);

        if (results.rowCount === 0) return res.status(200).json({ favourites: [] });

        // collect all image ids and dedupe
        const allImageIds = results.rows.flatMap(r => (r.image_ids || []));
        const uniqueImageIds = [...new Set(allImageIds.map(String))];

        // fetch CDN mapping once: fileId -> cdnUrl
        const fetchImageMap = async (fileIds) => {
            if (!fileIds || fileIds.length === 0) return new Map();
            try {
                const response = await fetch(`${config.CDN.url}/${config.CDN.apiKey}/get`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileIds })
                });
                if (!response.ok) return new Map();
                const json = await response.json();
                const files = json.files || [];
                const map = new Map();
                for (const f of files) {
                    if (f && f.fileId) map.set(String(f.fileId), f.cdnUrl || null);
                }
                return map;
            }
            catch (err) {
                return new Map();
            }
        };

        const imageMap = await fetchImageMap(uniqueImageIds);

        const favourites = results.rows.map(r => {
            const firstImage = (r.image_ids || [])
                .map(id => imageMap.get(String(id)))
                .filter(Boolean)[0];
            return {
                id: r.product_id,
                name: r.name,
                price: r.price,
                images: firstImage ? [firstImage] : []
            };
        });

        res.status(200).json({ favourites });
    }
    catch (err) {
        res.status(500).json({ message: 'Hiba történt a kedvencek lekérése során' });
    }
    finally {
        conn.release();
    }
}