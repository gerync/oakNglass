import { query } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import config from '../../config.js';
import { Coloredlog } from '@gerync/utils2';

export default async function listProductsController(req, res, next) {
    let { limit, offset, page } = req.pagination || {};
    let { sortby, sortorder } = req.sorting || {};
    let { minprice, maxprice, minstock, maxstock, minalcohol, maxalcohol, mincontent, maxcontent, search } = req.filters || {};

    // Ensure numeric pagination
    limit = Number(limit) || 12;
    offset = Number(offset) || 0;
    page = Number(page) || 1;

    try {
        const whereClauses = [];
        const values = [];
        let paramIndex = 1;
        if (minprice !== undefined) {
            whereClauses.push(`PriceHUF >= $${paramIndex++}`);
            values.push(minprice);
        }
        if (maxprice !== undefined) {
            whereClauses.push(`PriceHUF <= $${paramIndex++}`);
            values.push(maxprice);
        }
        if (minstock !== undefined) {
            whereClauses.push(`Stock >= $${paramIndex++}`);
            values.push(minstock);
        }
        if (maxstock !== undefined) {
            whereClauses.push(`Stock <= $${paramIndex++}`);
            values.push(maxstock);
        }
        if (minalcohol !== undefined) {
            whereClauses.push(`AlcoholPercent >= $${paramIndex++}`);
            values.push(minalcohol);
        }
        if (maxalcohol !== undefined) {
            whereClauses.push(`AlcoholPercent <= $${paramIndex++}`);
            values.push(maxalcohol);
        }
        if (mincontent !== undefined) {
            whereClauses.push(`ContentML >= $${paramIndex++}`);
            values.push(mincontent);
        }
        if (maxcontent !== undefined) {
            whereClauses.push(`ContentML <= $${paramIndex++}`);
            values.push(maxcontent);
        }
        if (search !== undefined && String(search).trim() !== '') {
            whereClauses.push(`Name ILIKE $${paramIndex++}`);
            values.push(`%${search}%`);
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // total count
        const countQuery = `SELECT COUNT(*)::int AS count FROM Products ${whereClause}`;
        const [countRows] = await query(countQuery, values);
        const totalItems = parseInt(countRows[0]?.count ?? '0', 10);
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;
        if (page > totalPages && totalPages > 0) {
            return next(new HttpError('A page értéke nagyobb, mint a rendelkezésre álló oldalak száma', 400));
        }

        // Aggregate images into one row per product
        const dataQuery = `SELECT p.ProdID, p.Name, p.AlcoholPercent, p.ContentML, p.PriceHUF, p.Stock, p.CreatedAt,
            COALESCE(json_agg(pi.ID) FILTER (WHERE pi.ID IS NOT NULL), '[]') AS images
            FROM Products p
            LEFT JOIN ProductImages pi ON p.ProdID = pi.ProdID
            ${whereClause}
            GROUP BY p.ProdID
            ORDER BY ${sortby} ${sortorder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

        values.push(limit, offset);
        const [rows] = await query(dataQuery, values);
        
        const allImageIds = new Set();
        for (const r of rows) {
            try {
                const imgs = r.images || [];
                if (Array.isArray(imgs)) imgs.forEach(id => { if (id) allImageIds.add(id); });
            } catch (e) {}
        }

        const fileMap = new Map();
        if (allImageIds.size > 0) {
            const uniqueIds = Array.from(allImageIds);
            try {
                const resp = await fetch(`${config.CDN.url}/${config.CDN.apiKey}/get`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileIds: uniqueIds })
                });
                const data = await resp.json();
                if (resp.ok && data && Array.isArray(data.files)) {
                    for (const f of data.files) {
                        const id = String(f.id ?? f.fileId ?? f.fileID ?? f.ImageID ?? f.imageid ?? '');
                        const url = f.cdnUrl ?? f.cdn_url ?? f.url ?? null;
                        if (id && url) fileMap.set(id, url);
                    }
                }
            } catch (err) {
                Coloredlog.error(`CDN batch fetch failed: ${err.message}`);
            }
        }

        const products = rows.map(r => {
            const imgs = Array.isArray(r.images) ? r.images : [];
            const imageUrls = imgs.map(id => fileMap.get(String(id))).filter(Boolean);
            return {
                ProdID: r.prodid,
                name: r.name,
                alcoholPercent: r.alcoholpercent,
                contentML: r.contentml,
                priceHUF: r.pricehuf,
                stock: r.stock,
                createdAt: r.createdat,
                images: imageUrls
            };
        });

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
        try {
            Coloredlog(`Products list error: ${err && err.message ? err.message : String(err)}`, '#ff0000');
        } catch (e) {}
        // Propagate original error when possible to preserve stack/message for debugging
        if (err && err instanceof HttpError) return next(err);
        return next(new HttpError(err && err.message ? err.message : 'Hiba a termékek lekérésekor', 500));
    }
}

export async function getProductDetailsController(req, res, next) {
    const id = req.productID;
    try {
        const queryStr = `SELECT p.ProdID, p.Name, p.AlcoholPercent, p.ContentML, p.PriceHUF, p.Stock, p.CreatedAt,
            COALESCE(json_agg(pi.ID) FILTER (WHERE pi.ID IS NOT NULL), '[]') AS images
            FROM Products p
            LEFT JOIN ProductImages pi ON p.ProdID = pi.ProdID
            WHERE p.ProdID = $1
            GROUP BY p.ProdID`;
        const [rows] = await query(queryStr, [id]);
        if (rows.length === 0) {
            return next(new HttpError('A termék nem található', 404));
        }
        const product = rows[0];

        const imageIds = Array.isArray(product.images) ? product.images : [];
        let imageUrls = [];

        if (imageIds.length > 0) {
            try {
                const resp = await fetch(`${config.CDN.url}/${config.CDN.apiKey}/get`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileIds: imageIds })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    const files = Array.isArray(data.files) ? data.files : [];
                    const map = new Map(files.map(f => [String(f.fileId ?? f.id ?? ''), f.cdnUrl ?? f.cdn_url ?? f.url ?? null]));
                    imageUrls = imageIds.map(id => map.get(String(id))).filter(Boolean);
                }
            } catch (err) {
                Coloredlog.error(`CDN batch fetch failed: ${err.message}`);
            }
        }

        res.json({
            id: product.prodid,
            name: product.name,
            alcoholPercent: product.alcoholpercent,
            contentML: product.contentml,
            priceHUF: product.pricehuf,
            stock: product.stock,
            createdAt: product.createdat,
            images: imageUrls
        });
    }
    catch (err) {
        try {
            Coloredlog(`Product details error: ${err && err.message ? err.message : String(err)}`, '#ff0000');
        } catch (e) {}
        if (err && err instanceof HttpError) return next(err);
        return next(new HttpError(err && err.message ? err.message : 'Hiba a termék részleteinek lekérésekor', 500));
    }
}