import { pool } from "../../db/pool.js";
import code from "../../utils/code.js";
import { decryptData } from "../../utils/security/encrypt.js";
import { hashData } from "../../utils/security/hash.js";
import HttpError from '../../models/httpError.js';

export default async function VerifyController(req, res) {
    const verificationCode = req.verification.code;
    const email = req.verification.email || null;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const codeRes = await client.query(
            'SELECT userid, expiresat FROM emailcodes WHERE hashedcode = $1 AND type = $2',
            [hashData(verificationCode), 'verification']
        );
        if (codeRes.rows.length === 0) {
            throw new HttpError('Érvénytelen kód', 400);
        }
        const { userid, expiresat } = codeRes.rows[0];
        if (expiresat < new Date()) {
            await client.query('DELETE FROM emailcodes WHERE userid = $1 AND type = $2', [userid, 'verification']);
            await code('verification', userid);
            await client.query('COMMIT');
            throw new HttpError('Lejárt kód, új kód kiküldve', 400);
        }
        const userRes = await client.query('SELECT emailenc FROM users WHERE uuid = $1', [userid]);
        if (userRes.rows.length === 0) {
            throw new HttpError('Felhasználó nem található', 404);
        }
        const decryptedEmail = decryptData(userRes.rows[0].emailenc);
        if (email && decryptedEmail !== email) {
            throw new HttpError('Kód és email párosítás érvénytelen', 400);
        }
        await client.query('UPDATE users SET verifiedemail = true WHERE uuid = $1', [userid]);
        await client.query('DELETE FROM emailcodes WHERE userid = $1 AND type = $2', [userid, 'verification']);
        await client.query('COMMIT');
        return res.json({ message: 'Email cím sikeresen megerősítve' });
    }
    catch (err) {
        await client.query('ROLLBACK');
        const httpErr = err instanceof HttpError ? err : new HttpError(`${req.method} ${req.originalUrl} - ${err.message}`, err.status || 500);
        throw httpErr;
    } finally {
        client.release();
    }
}