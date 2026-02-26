import { pool } from "../../db/pool.js";
import encrypt from "../../utils/security/encrypt.js";
import hash from "../../utils/security/hash.js";
import sendcode from "../../utils/code.js";
import HttpError from "../../models/httpError.js";

export default async function ResetPassController(req, res) {
    
    if (req.body.email || req.body.mobile) {
        const email = req.body.email;
        const mobile = req.body.mobile;
        const conn = await pool.connect();
        try {
            let userRes;
            if (typeof email !== 'undefined') {
                 userRes = await conn.query('SELECT uuid FROM users WHERE emailenc = $1', [encrypt.encryptData(email)]);
            }
            else {
                 userRes = await conn.query('SELECT uuid FROM users WHERE mobileenc = $1', [encrypt.encryptData(mobile)]);
            }
            if (userRes.rows.length === 0) {
                throw new HttpError('Ha van ilyen email cím vagy telefonszám, akkor a levelezésében találja a kódot.', 200);
            }
            const userId = userRes.rows[0].uuid;
            await sendcode('reset-password', userId);
            throw new HttpError('Ha van ilyen email cím vagy telefonszám, akkor a levelezésében találja a kódot.', 200);
        }
        catch (err) {
            throw err;
        }
        finally {
            conn.release();
        }
    }
    else if (req.email && req.code) {
        const email = req.email;
        const code = req.code;
        const conn = await pool.connect();
        try {
            await conn.query('BEGIN');
            const result = await conn.query(`
                SELECT users.uuid, emailcodes.hashedcode, emailcodes.expiresat
                FROM emailcodes INNER JOIN users ON emailcodes.userid = users.uuid
                WHERE users.emailenc = $1 AND emailcodes.type = $2`,
                    [encrypt.encryptData(email), 'reset-password']);
            if (result.rows.length === 0) {
                throw new HttpError('Érvénytelen vagy lejárt kód', 400);
            }
            const { uuid, hashedcode, expiresat } = result.rows[0];
            
            if (expiresat < new Date()) {
                await conn.query('ROLLBACK');
                await sendcode('reset', uuid);
                throw new HttpError('A kód lejárt, email címére küldtünk egy új kódot.', 400);
            }
            const codeMatch = hash.compareHash(code, hashedcode);
            if (!codeMatch) {
                throw new HttpError('Érvénytelen vagy lejárt kód', 400);
            }
            if (!req.newPassword) {
                throw new HttpError('Hiányzó jelszó', 400);
            }
            const passhash = await hash.hashPassword(req.newPassword);
            await conn.query('UPDATE users SET hashedpassword = $1 WHERE uuid = $2', [passhash, uuid]);
            await conn.query('DELETE FROM emailcodes WHERE userid = $1 AND type = $2', [uuid, 'reset']);
            await conn.query('COMMIT');
            res.json({ message: 'Kód érvényes, folytathatja a jelszó visszaállítását.' });
        }
        catch (err) {
            await conn.query('ROLLBACK');
            throw err;
        }
        finally {
            conn.release();
        }
    }
    else {
        throw new HttpError('Érvénytelen kérés', 400);
    }
}