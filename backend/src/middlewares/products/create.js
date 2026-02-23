import HttpError from '../../models/httpError.js';
import busboy from 'busboy';

export default function uploadProductMiddleware(req, res, next) {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
        return next(new HttpError('Missing multipart/form-data', 400));
    }

    const bb = busboy({ headers: req.headers });
    const productData = {
        name: null,
        alcoholPerc: 0,
        contentML: null,
        priceHUF: null,
        Stock: null,
        images: []
    };

    let activeFiles = 0;
    let finishedParsing = false;

    function checkFinish() {
        if (finishedParsing && activeFiles === 0) {
            handleFinalize();
        }
    }

    bb.on('file', (name, file, info) => {
        activeFiles++;
        // Use CamelCase mimeType as per busboy documentation
        const { filename, encoding, mimeType } = info;
        const chunks = [];
        file.on('data', (data) => {
            chunks.push(data);
        }).on('close', () => {
            const buffer = Buffer.concat(chunks);
            productData.images.push({
                originalname: filename,
                mimetype: mimeType || 'application/octet-stream',
                buffer: buffer,
                size: buffer.length
            });
            activeFiles--;
            checkFinish();
        });
    });

    bb.on('field', (name, val) => {
        if (name === 'name') productData.name = val;
        if (name === 'alcoholPerc') productData.alcoholPerc = val;
        if (name === 'contentML') productData.contentML = val;
        if (name === 'priceHUF') productData.priceHUF = val;
        if (name === 'Stock') productData.Stock = val;
    });

    bb.on('finish', () => {
        finishedParsing = true;
        checkFinish();
    });

    function handleFinalize() {
        let { name, alcoholPerc, contentML, priceHUF, Stock, images } = productData;

        if (!name) {
            return next(new HttpError('Hiányzó név', 400));
        }
        if (!alcoholPerc) {
            alcoholPerc = 0;
        }
        if (isNaN(parseFloat(alcoholPerc))) {
            return next(new HttpError('Az alkoholtartalomnak számnak kell lennie', 400));
        }
        if (!contentML) {
            return next(new HttpError('Hiányzó tartalom (ml)', 400));
        }
        if (isNaN(parseInt(contentML))) {
            return next(new HttpError('A tartalomnak egész számnak kell lennie', 400));
        }
        contentML = parseInt(contentML);
        if (!priceHUF) {
            return next(new HttpError('Hiányzó ár (HUF)', 400));
        }
        if (isNaN(parseInt(priceHUF))) {
            return next(new HttpError('Az árnak egész számnak kell lennie', 400));
        }
        priceHUF = parseInt(priceHUF);
        if (!Stock) {
            return next(new HttpError('Hiányzó készlet', 400));
        }
        if (isNaN(parseInt(Stock))) {
            return next(new HttpError('A készletnek egész számnak kell lennie', 400));
        }
        Stock = parseInt(Stock);
        if (!images || images.length === 0) {
            return next(new HttpError('Hiányzó képek', 400));
        }
        if (images.length > 5) {
            return next(new HttpError('Túl sok kép (maximum 5)', 400));
        }
        
        for (const image of images) {
            if (!image.mimetype.startsWith('image/')) {
                return next(new HttpError('Csak képek engedélyezettek', 400));
            }
            if (image.size > 8 * 1024 * 1024) {
                return next(new HttpError('A kép mérete nem lehet nagyobb 8MB-nál', 400));
            }
        }
        
        if (alcoholPerc < 0 || alcoholPerc > 100) {
            return next(new HttpError('Az alkoholtartalomnak 0 és 100 között kell lennie', 400));
        }
        if (contentML <= 0) {
            return next(new HttpError('A tartalomnak pozitív számnak kell lennie', 400));
        }
        if (priceHUF < 0) {
            return next(new HttpError('Az ár nem lehet negatív', 400));
        }
        if (Stock < 0) {
            return next(new HttpError('A készlet nem lehet negatív', 400));
        }

        req.productData = { name, alcoholPerc, contentML, priceHUF, Stock, images };
        next();
    }

    bb.on('error', (err) => {
        next(new HttpError(`Fájlfeltöltési hiba: ${err.message}`, 500));
    });

    req.pipe(bb);
}
