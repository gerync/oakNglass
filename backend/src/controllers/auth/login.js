import HttpError from "../../models/httpError.js";
import { pool } from "../../db/pool.js";
import hash from "../../utils/security/hash.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";


import config from "../../config.js";

export default async function LoginController(req, res) {
    const { identifier, password } = req.body;

    const hashedIdentifier = hash.hashData(identifier);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userRes = await client.query(
            'SELECT uuid, hashedpassword, role FROM users WHERE hashedemail = $1 OR hashedmobilenumber = $2',
            [hashedIdentifier, hashedIdentifier]
        );
        if (userRes.rows.length === 0) {
            throw new HttpError('Hibás azonosító vagy jelszó', 401);
        }
        const { uuid, hashedpassword, role } = userRes.rows[0];
        const passwordMatch = await hash.verifyPassword(password, hashedpassword);
        if (!passwordMatch) {
            throw new HttpError('Hibás azonosító vagy jelszó', 401);
        }
        
        const expiresAt = new Date(Date.now() + config.security.tokenExpiry.refresh);
        const tokenID = crypto.randomUUID();
        await client.query(
            'INSERT INTO refreshtokens (userid, tokenid, expiresat) VALUES ($1, $2, $3)',
            [uuid, tokenID, expiresAt]
        );
        const refreshPayload = { tokenid: tokenID, accessversion: 1 };
        const refreshToken = jwt.sign(refreshPayload, config.security.secrets.jwt2, { expiresIn: config.security.tokenExpiry.refresh });

        await client.query('COMMIT');
        
        const accessPayload = { uuid: uuid, role, version: 1 };
        const accessToken = jwt.sign(accessPayload, config.security.secrets.jwt, { expiresIn: config.security.tokenExpiry.access });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config.backend.host.includes('localhost') ? false : true,
            sameSite: 'lax',
            maxAge: config.security.tokenExpiry.refresh * 1.5
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: config.backend.host.includes('localhost') ? false : true,
            sameSite: 'lax',
            maxAge: config.security.tokenExpiry.access * 1.5
        });
        res.cookie('loggedIn', 'true', {
            httpOnly: false,
            secure: config.backend.host.includes('localhost') ? false : true,
            sameSite: 'lax',
            maxAge: config.security.tokenExpiry.refresh * 1.5
        });
        return res.status(200).json({ message: 'Sikeres bejelentkezés' });
    }
    catch (err) {
        await client.query('ROLLBACK');
        const httpErr = err instanceof HttpError ? err : new HttpError(`${req.method} ${req.originalUrl} - ${err.message}`, err.status || 500);
        throw httpErr;
    }
    finally {
        client.release();
    }
}