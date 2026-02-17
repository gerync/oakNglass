import { pool } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';
import sendEmail from '../../email/index.js';
import { decryptData } from '../../utils/security/encrypt.js';
import config from '../../config.js';
import { buildOrderHtml } from '../../email/content.js';

export async function OrderProductsController(req, res, next) {
    const userId = req.user.uuid;
    const products = req.body.products;
    const conn = await pool.connect();
    try {
        await conn.query('BEGIN');
        const result = await conn.query(
            'INSERT INTO Orders (UserID, TotalPriceHUF, ShipmentAddress) VALUES ($1, $2, $3) RETURNING OrderID',
            [userId, 0, req.body.shipmentAddress]
        );
        const orderId = result.rows[0].orderid;
        let totalPrice = 0;
        const items = [];
        for (const product of products) {
            try {
                const insertResult = await conn.query(
                    'INSERT INTO OrderItems (OrderID, ProdID, Quantity) VALUES ($1, $2, $3) RETURNING OrderItemID',
                    [orderId, product.productId, product.quantity]
                );
                const orderItemId = insertResult.rows[0].orderitemid;
                if (!orderItemId) {
                    await conn.query('ROLLBACK');
                    return next(new HttpError('Hiba történt a termék beszúrásakor.', 500));
                }
                const priceResult = await conn.query(
                    'SELECT PriceHUF, Name FROM Products WHERE ProdID = $1',
                    [product.productId]
                );
                if (priceResult.rows.length === 0) {
                    await conn.query('ROLLBACK');
                    return next(new HttpError('Termék nem található.', 404));
                }
                const price = priceResult.rows[0].pricehuf;
                const name = priceResult.rows[0].name;
                const lineTotal = price * product.quantity;
                items.push({ name, price, quantity: product.quantity, lineTotal });
                totalPrice += lineTotal;
            } catch (err) {
                await conn.query('ROLLBACK');
                return next(new HttpError('Hiba történt a termék beszúrásakor.', 500));
            }
        }
        await conn.query(
            'UPDATE Orders SET TotalPriceHUF = $1 WHERE OrderID = $2',
            [totalPrice, orderId]
        );
        await conn.query('COMMIT');
        // Send a confirmation email (best-effort) using the email content helper
        try {
            const userRes = await pool.query('SELECT fullnameenc, emailenc FROM users WHERE uuid = $1', [userId]);
            if (userRes.rows.length > 0) {
                const fullName = decryptData(userRes.rows[0].fullnameenc, config.security.secrets.encryption);
                const email = decryptData(userRes.rows[0].emailenc, config.security.secrets.encryption);
                const orderHtml = buildOrderHtml(items, totalPrice, orderId);
                await sendEmail(email, orderHtml, 'orderConfirmation', `${config.frontend.domain()}/orders/${orderId}`, fullName);
            }
        } catch (emailErr) {
            console.error('Hiba az email küldésekor:', emailErr);
        }

        res.status(201).json({ orderId });
    } catch (err) {
        await conn.query('ROLLBACK');
        next(new HttpError('Hiba történt az rendelés létrehozásakor.', 500));
    } finally {
        conn.release();
    }
}

export async function GetMyOrders(req, res, next) {
    const userId = req.user.uuid;
    try {
        const result = await pool.query(
            'SELECT OrderID, TotalPriceHUF, ShipmentAddress, OrderDate FROM Orders WHERE UserID = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        next(new HttpError('Hiba történt a rendelések lekérésekor.', 500));
    }    
}

export async function GetOrderDetails(req, res, next) {
    const userId = req.user.uuid;
    const orderId = req.params.orderId;
    try {
        const orderResult = await pool.query(
            'SELECT OrderID, TotalPriceHUF, ShipmentAddress, OrderDate FROM Orders WHERE OrderID = $1 AND UserID = $2',
            [orderId, userId]
        );
        if (orderResult.rows.length === 0) {
            return next(new HttpError('Rendelés nem található.', 404));
        }
        const order = orderResult.rows[0];
        const itemsResult = await pool.query(
            'SELECT oi.OrderItemID, oi.ProdID, oi.Quantity, p.Name, p.PriceHUF FROM OrderItems oi JOIN Products p ON oi.ProdID = p.ProdID WHERE oi.OrderID = $1',
            [orderId]
        );
        order.items = itemsResult.rows;
        res.json(order);
    }
    catch (err) {
        next(new HttpError('Hiba történt a rendelés részleteinek lekérésekor.', 500));
    }
}