import { pool } from "../../db/pool.js";
import HttpError from "../../models/httpError.js";

export default async function logoutMiddleware(req, res, next) {
    const user = req.user;

    const conn = await pool.connect();
    try {
        await conn.query('UPDATE refreshtokens SET revoked = true WHERE tokenuserid = $1', [user.uuid]);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('loggedIn');
        return res.status(200).json({ message: 'Sikeres kijelentkezés' });
    }
    catch (err) {
        const httpErr = err instanceof HttpError ? err : new HttpError(`${req.method} ${req.originalUrl} - ${err.message}`, err.status || 500);
        throw httpErr;
    }
    finally {
        conn.release();
    }
}