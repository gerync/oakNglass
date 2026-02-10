import { query } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import config from '../../config.js';
import { Colorlog } from '@gerync/utils2';

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
            whereClauses.push(`alcoholpercent >= $${paramIndex++}`);
            values.push(minalcohol);
        }
        if (maxalcohol !== undefined) {
            whereClauses.push(`alcoholpercent <= $${paramIndex++}`);
            values.push(maxalcohol);
        }
        if (mincontent !== undefined) {
            whereClauses.push(`contentml >= $${paramIndex++}`);
            values.push(mincontent);
        }
        if (maxcontent !== undefined) {
            whereClauses.push(`contentml <= $${paramIndex++}`);
            values.push(maxcontent);
        }
        if (search !== undefined && String(search).trim() !== '') {
            whereClauses.push(`name ILIKE $${paramIndex++}`);
            values.push(`%${search}%`);
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // total count
        const countQuery = `SELECT COUNT(*)::int AS count FROM products ${whereClause}`;
        const [countRows] = await query(countQuery, values);
        const totalItems = parseInt(countRows[0]?.count ?? '0', 10);
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;
        if (page > totalPages && totalPages > 0) {
            return next(new HttpError('A page értéke nagyobb, mint a rendelkezésre álló oldalak száma', 400));
        }

        // Aggregate images into one row per product
        const dataQuery = `SELECT p.prodid, p.name, p.alcoholpercent, p.contentml, p.pricehuf, p.stock, p.createdat,
            COALESCE(json_agg(pi.id) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
            FROM products p
            LEFT JOIN productimages pi ON p.prodid = pi.prodid
            ${whereClause}
            GROUP BY p.prodid
            ORDER BY ${sortby} ${sortorder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

        values.push(limit, offset);
        const [rows] = await query(dataQuery, values);

        // Collect unique image ids and batch-fetch CDN URLs
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
                if (resp.ok && data && data.ok && Array.isArray(data.files)) {
                    for (const f of data.files) {
                        const id = String(f.id ?? f.fileId ?? f.fileID ?? f.ImageID ?? f.imageid ?? '');
                        const url = f.cdnUrl ?? f.cdn_url ?? f.url ?? null;
                        if (id && url) fileMap.set(id, url);
                    }
                }
            } catch (err) {
                Colorlog.error(`CDN batch fetch failed: ${err.message}`);
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
        next(new HttpError('Hiba a termékek lekérésekor', 500));
    }
}