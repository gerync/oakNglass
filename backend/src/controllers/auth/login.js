import pool from '../../pool.js';
import { hashData, UserError, signToken } from '@gerync/utils2';
import config from '../../../config.json' assert { type: 'json' };
import ConvertNumberWithUnit from '../../utils/timeConverter.js';
import argon from 'argon2';

export default async function loginController(req, res) {
    const { identifier, password, keepMe } = req.body;
    const conn = await pool.getConnection();
    const hashedIdentifier = hashData(identifier.toLowerCase());
    const searchQuery = 'SELECT * FROM Users WHERE HashedEmail = ? OR HashedMobileNumber = ?';
    const [rows] = await conn.query(searchQuery, [hashedIdentifier, hashedIdentifier]);
    conn.release();
    if (rows.length === 0) {
        throw new UserError('Hibás azonosító vagy jelszó!', 404);
    }
    const user = rows[0];
    const passwordMatch = await argon.verify(user.HashedPassword, password);
    if (!passwordMatch) {
        throw new UserError('Hibás azonosító vagy jelszó!', 404);
    }
    const AccesstokenPayload = {
        uuid: user.UUID,
        role: user.Role
    };
    const AccessToken = signToken(AccesstokenPayload, config.security.tokenExpiry.access);
    res.cookie('AccessToken', AccessToken, {
        httpOnly: true,
        secure: config.isProduction,
        maxAge: keepMe ? ConvertNumberWithUnit(config.security.tokenExpiry.access) : null,
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Sikeres bejelentkezés!'});
}