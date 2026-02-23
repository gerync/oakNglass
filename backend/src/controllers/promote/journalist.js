import { pool } from "../../db/pool.js";
import HttpError from "../../models/httpError.js";
import code from "../../utils/code.js";
import hash from "../../utils/security/hash.js";
import { decryptData } from "../../utils/security/encrypt.js";

export default async function PromoteToJournalistController(req, res) {
    const { code: providedCode, email: providedEmail } = req.verification || {};

    if (!providedCode) {
        throw new HttpError('Hibás kérés', 400);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(`
            SELECT users.role, emailcodes.userid, emailcodes.expiresat, users.emailenc, emailcodes.hashedcode
            FROM emailcodes
            JOIN users ON emailcodes.userid = users.uuid
            WHERE emailcodes.type = 'journalist-invite'`
        );

        if (result.rowCount === 0) {
            throw new HttpError('Hibás vagy lejárt kód', 400);
        }

        let matched = null;
        for (const row of result.rows) {
            try {
                const ok = hash.compareHash(providedCode, row.hashedcode);
                if (ok) {
                    matched = row;
                    break;
                }
            } catch (e) {
                throw new HttpError('Hibás vagy lejárt kód', 400);
            }
        }

        if (!matched) {
            throw new HttpError('Hibás vagy lejárt kód', 400);
        }

        const { role, userid, expiresat, emailenc } = matched;
        if (role !== 'user') {
            throw new HttpError('A meghívó csak sima felhasználóknak szól', 400);
        }

        if (new Date(expiresat) < new Date()) {
            await code('journalist-invite', userid);
            throw new HttpError('A meghívó lejárt, új emailt küldtünk', 400);
        }

        const decryptedEmail = decryptData(emailenc);
        if (providedEmail && decryptedEmail !== providedEmail) {
            throw new HttpError('Hibás email', 400);
        }

        await client.query('UPDATE users SET role = $1 WHERE uuid = $2', ['journalist', userid]);
        await client.query('DELETE FROM emailcodes WHERE userid = $1 AND type = $2', [userid, 'journalist-invite']);
        await client.query('COMMIT');
        res.status(200).json({ message: 'Gratulálunk, sikeresen előléptél újságíróvá!' });
    }
    catch (err) {
        try { await client.query('ROLLBACK'); } catch (e) {}
        throw err;
    }
    finally {
        client.release();
    }
}