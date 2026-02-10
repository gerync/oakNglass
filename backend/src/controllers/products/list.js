import { query } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import config from '../../config.js';
import { Colorlog } from '@gerync/utils2';

export default async function listProductsController(req, res, next) {
    const pagination = req.pagination || {};
    const limit = Number(pagination.limit) || 10;
    const offset = Number(pagination.offset) || 0;
    const page = Number(pagination.page) || 1;

    try {
        const [products] = await query(
            `SELECT p.ProdID, p.Name, p.Price,
                (SELECT pi.ImageID FROM ProductImages pi WHERE pi.ProdID = p.ProdID ORDER BY pi.CreatedAt DESC LIMIT 1) AS ImageID
            FROM Products p
            ORDER BY p.CreatedAt DESC
            LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const [totalCountResult] = await query(
            'SELECT COUNT(*)::int AS total FROM Products'
        );
        const totalCount = totalCountResult[0]?.total ?? 0;

        // Batch-fetch CDN URLs for all image IDs to avoid N+1 requests
        const imageIds = products.map(p => p.imageid).filter(Boolean);
        const uniqueImageIds = [...new Set(imageIds)];
        const fileMap = new Map();
        if (uniqueImageIds.length) {
            try {
                const response = await fetch(`${config.CDN.url}/${config.CDN.apiKey}/get`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileIds: uniqueImageIds })
                });
                const data = await response.json();
                if (response.ok && data && data.ok && Array.isArray(data.files)) {
                    for (const f of data.files) {
                        const id = f.id ?? f.fileId ?? f.fileID ?? f.ImageID ?? f.imageid;
                        const url = f.cdnUrl ?? f.cdn_url ?? f.url;
                        if (id && url) fileMap.set(String(id), url);
                    }
                }
            } catch (err) {
                Colorlog(['CDN lekérés hiba:', err.message], ['yellow', 'red']);
            }
        }

        const productsWithImage = products.map(product => {
            const prodid = product.prodid ?? product.ProdID;
            const name = product.name ?? product.Name;
            const price = product.price ?? product.Price;
            const imageid = product.imageid ?? product.ImageID;
            const image = imageid ? (fileMap.get(String(imageid)) ?? null) : null;
            return {
                ProdID: prodid,
                Name: name,
                Price: price,
                ImageURL: image
            };
        });

        res.json({
            products: productsWithImage,
            pagination: {
                total: totalCount,
                page,
                limit
            }
        });
    } catch (err) {
        next(new HttpError('Hiba a termékek lekérésekor', 500));
    }
}