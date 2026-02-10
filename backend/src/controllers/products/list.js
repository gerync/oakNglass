import { query } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import config from '../../config.js';
import { Colorlog } from '@gerync/utils2';

export default async function listProductsController(req, res, next) {
    let { limit, offset, page } = req.pagination || {};
    let { sortby, sortorder } = req.sorting || {};
    let { minprice, maxprice, minstock, maxstock, minalcohol, maxalcohol, mincontent, maxcontent, search } = req.filters || {};

    try {
        const whereClauses = [];
        const values = [];
        let paramIndex = 1;
        if (minprice !== undefined) {
            whereClauses.push(`pricehuf >= $${paramIndex++}`);
            values.push(minprice);
        }
        if (maxprice !== undefined) {
            whereClauses.push(`pricehuf <= $${paramIndex++}`);
            values.push(maxprice);
        }
        if (minstock !== undefined) {
            whereClauses.push(`stock >= $${paramIndex++}`);
            values.push(minstock);
        }
        if (maxstock !== undefined) {
            whereClauses.push(`stock <= $${paramIndex++}`);
            values.push(maxstock);
        }
        if (minalcohol !== undefined) {
            whereClauses.push(`alcohol_perc >= $${paramIndex++}`);
            values.push(minalcohol);
        }
        if (maxalcohol !== undefined) {
            whereClauses.push(`alcohol_perc <= $${paramIndex++}`);
            values.push(maxalcohol);
        }
        if (mincontent !== undefined) {
            whereClauses.push(`content_ml >= $${paramIndex++}`);
            values.push(mincontent);
        }
        if (maxcontent !== undefined) {
            whereClauses.push(`content_ml <= $${paramIndex++}`);
            values.push(maxcontent);
        }
        if (search !== undefined) {
            whereClauses.push(`name ILIKE $${paramIndex++}`);
            values.push(`%${search}%`);
        }
        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
        const countResult = await query(countQuery, values);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit);
        if (page > totalPages && totalPages > 0) {
            return next(new HttpError('A page értéke nagyobb, mint a rendelkezésre álló oldalak száma', 400));
        }
        const dataQuery = `WITH ProductList AS (
            SELECT * FROM products
            ${whereClause}
            ORDER BY ${sortby} ${sortorder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        )
            SELECT productimages.id AS imageid, ProductList.*
            FROM ProductList
            RIGHT JOIN productimages ON ProductList.prodid = productimages.prodid
            ORDER BY ${sortby} ${sortorder}`;
        values.push(limit, offset);
        const dataResult = await query(dataQuery, values);
        const products = [];
        for (const row of dataResult.rows) {
            try {
                const response = await fetch(`${config.CDN.url}/${config.CDN.apiKey}/get`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fileId: row.imageid })
                });
                const data = await response.json();
                if (!response.ok || !data.ok) {
                    throw new Error(`Hiba a fájlok lekérésekor: ${data.error || response.statusText}`);
                }
                const imageUrl = data.files[0].url;
                let product = products.find(p => p.ProdID === row.prodid);
                if (!product) {
                    product = {
                        ProdID: row.prodid,
                        name: row.name,
                        alcoholPerc: row.alcohol_perc,
                        contentML: row.content_ml,
                        priceHUF: row.pricehuf,
                        stock: row.stock,
                        createdAt: row.createdat,
                        images: [imageUrl]
                    };
                    products.push(product);
                }
                else {
                    product.images.push(imageUrl);
                }
            }
            catch (err) {
                Colorlog.error(`Hiba a fájlok lekérésekor: ${err.message}`);
                let product = products.find(p => p.ProdID === row.prodid);
                if (!product) {
                    product = {
                        ProdID: row.prodid,
                        name: row.name,
                        alcoholPerc: row.alcohol_perc,
                        contentML: row.content_ml,
                        priceHUF: row.pricehuf,
                        stock: row.stock,
                        createdAt: row.createdat,
                        images: []
                    };
                    products.push(product);
                }
            }
        }
        res.json({
            products,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        next(new HttpError('Hiba a termékek lekérésekor', 500));
    }
}