import HttpError from '../../models/httpError.js';


export default function uploadProductMiddleware(req, res, next) {
    let { name, alcoholPerc, contentML, priceHUF, Stock } = req.body;
    const images = req.files;

    if (!name) {
        throw new HttpError('Hiányzó név', 400);
    }
    if (!alcoholPerc) {
        alcoholPerc = 0;
    }
    if (isNaN(parseFloat(alcoholPerc))) {
        throw new HttpError('Az alkoholtartalomnak számnak kell lennie', 400);
    }
    if (!contentML) {
        throw new HttpError('Hiányzó tartalom (ml)', 400);
    }
    if (isNaN(parseInt(contentML))) {
        throw new HttpError('A tartalomnak egész számnak kell lennie', 400);
    }
    contentML = parseInt(contentML);
    if (!priceHUF) {
        throw new HttpError('Hiányzó ár (HUF)', 400);
    }
    if (isNaN(parseInt(priceHUF))) {
        throw new HttpError('Az árnak egész számnak kell lennie', 400);
    }
    priceHUF = parseInt(priceHUF);
    if (!Stock) {
        throw new HttpError('Hiányzó készlet', 400);
    }
    if (isNaN(parseInt(Stock))) {
        throw new HttpError('A készletnek egész számnak kell lennie', 400);
    }
    Stock = parseInt(Stock);
    if (!images || images.length === 0) {
        throw new HttpError('Hiányzó képek', 400);
    }
    if (images.length > 5) {
        throw new HttpError('Túl sok kép (maximum 5)', 400);
    }
    if (alcoholPerc < 0 || alcoholPerc > 100) {
        throw new HttpError('Az alkoholtartalomnak 0 és 100 között kell lennie', 400);
    }

    if (contentML <= 0) {
        throw new HttpError('A tartalomnak pozitív számnak kell lennie', 400);
    }
    if (priceHUF < 0) {
        throw new HttpError('Az ár nem lehet negatív', 400);
    }
    if (Stock < 0) {
        throw new HttpError('A készlet nem lehet negatív', 400);
    }

    for (const image of images) {
        if (!image.mimetype.startsWith('image/')) {
            throw new HttpError('Csak képek engedélyezettek', 400);
        }
        if (image.size > 8 * 1024 * 1024) {
            throw new HttpError('A kép mérete nem lehet nagyobb 8MB-nál', 400);
        }
    }
    req.productData = { name, alcoholPerc, contentML, priceHUF, Stock, images };
    next();
}