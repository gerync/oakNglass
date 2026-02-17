import { pool } from '../../db/pool.js';
import HttpError from '../../models/httpError.js';

export async function OrderProductsController(req, res, next) {
    const userId = req.user.id;
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
                    'SELECT PriceHUF FROM Products WHERE ProdID = $1',
                    [product.productId]
                );
                totalPrice += priceResult.rows[0].pricehuf * product.quantity;
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
        res.status(201).json({ orderId });
    } catch (err) {
        await conn.query('ROLLBACK');
        next(new HttpError('Hiba történt az rendelés létrehozásakor.', 500));
    } finally {
        conn.release();
    }
}

export async function GetMyOrders(req, res, next) {
    const userId = req.user.id;
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
    const userId = req.user.id;
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