import { pool } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import config from '../../config.js';

export async function uploadProductController(req, res) {
    const { name, alcoholPerc, contentML, priceHUF, Stock, images } = req.productData;
    const conn = await pool.connect();

    try {
        await conn.query('BEGIN');
        const cdnUrl = `${config.CDN.url}/${config.CDN.apiKey}/upload`;
        
        const imageIDs = [];
        for (const image of images) {
            try {
                const response = await fetch(cdnUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    body: {
                        files: image.buffer
                    }
                });
                const data = await response.json();
                if (!response.ok || !data.ok) {
                    throw new Error(`Hiba a fájlok feltöltésekor: ${data.error || response.statusText}`);
                }
                imageIDs.push(data.uploaded[0].fileId);
            }
            catch (err) {
                throw new HttpError(`Hiba a fájlok feltöltésekor: ${err.message}`, 500);
            }
        }
        
        const insertProductQuery = `
            INSERT INTO products (name, alcohol_perc, content_ml, price_huf, stock)
            VALUES ($1, $2, $3, $4, $5) RETURNING ProdID`;
        const result = await conn.query(insertProductQuery, [name, alcoholPerc, contentML, priceHUF, Stock]);
        if (result.rowCount === 0) {
            throw new HttpError('Hiba a termék létrehozásakor', 500);
        }
        const prodID = result.rows[0].prodid;
        const insertImageQuery = `
            INSERT INTO ProductImages (ID, ProdID)
            VALUES ($1, $2)`;
        for (const imageID of imageIDs) {
            await conn.query(insertImageQuery, [imageID, prodID]);
        }
        await conn.query('COMMIT');
        res.status(201).json({ message: 'Termék sikeresen feltöltve', productId: prodID });
    } catch (err) {
        await conn.query('ROLLBACK');
        if (err instanceof HttpError) {
            throw new HttpError(err.message, err.statusCode);
        } else {
            throw new HttpError('Hiba a termék feltöltésekor', 500);
        }
    } finally {
        conn.release();
    }
}