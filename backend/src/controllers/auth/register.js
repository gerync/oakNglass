import { User, UserTemp } from '../../models/user.js';
import hash from '../../utils/security/hash.js';
import encrypt from '../../utils/security/encrypt.js';
import db from '../../db/pool.js';

import code from '../../utils/code.js';
import HttpError from '../../models/httpError.js';

export default async function RegisterController(req, res) {
    const userTemp = req.userTemp;
    
    const client = await db.pool.connect();
    try {
        const hashedEmail = hash.hashData(userTemp.email);
        const hashedMobile = userTemp.mobile ? hash.hashData(userTemp.mobile) : null;
        const encryptedAddress = userTemp.address ? encrypt.encryptData(userTemp.address) : null;
        const hashedPassword = await hash.hashPassword(userTemp.password);
        const hashedFullName = hash.hashData(userTemp.fullName);
        const encryptedFullName = encrypt.encryptData(userTemp.fullName);
        const encryptedEmail = encrypt.encryptData(userTemp.email);
        const encryptedMobile = userTemp.mobile ? encrypt.encryptData(userTemp.mobile) : null;

        const newUser = new User(
            null,
            hashedFullName,
            encryptedFullName,
            encryptedEmail,
            hashedEmail,
            encryptedMobile,
            hashedMobile,
            hashedPassword,
            userTemp.birthdate,
            null,
            encryptedAddress,
            'user',
            req.emailSubscribe
        );
        // Check if a user already exists with same email or mobile
        if (newUser.hashedMobile) {
            const exists = await client.query('SELECT uuid FROM users WHERE hashedemail = $1 OR hashedmobile = $2', [newUser.hashedEmail, newUser.hashedMobile]);
            if (exists.rows.length) {
                throw new HttpError('Telefon szám vagy email cím már használatban van', 409);
            }
        } else {
            const exists = await client.query('SELECT uuid FROM users WHERE hashedemail = $1', [newUser.hashedEmail]);
            if (exists.rows.length) {
                throw new HttpError('Felhasználó már létezik', 409);
            }
        }

        await client.query('BEGIN');
        const insertQuery = `
            INSERT INTO users (HashedFullName, FullNameEnc, EmailEnc, HashedEmail, MobileEnc, HashedMobile, HashedPassword, Birthdate, AddressEnc, Role, EmailSubscribed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING uuid
        `;
        const insertValues = [
            newUser.hashedFullName,
            newUser.fullNameEnc,
            newUser.emailEnc,
            newUser.hashedEmail,
            newUser.mobileEnc,
            newUser.hashedMobile,
            newUser.hashedPassword,
            newUser.birthdate,
            newUser.addressEnc,
            newUser.role,
            newUser.emailSubscribed
        ];
        const result = await client.query(insertQuery, insertValues);
        await client.query('COMMIT');
        if (!result || !result.rows || !result.rows[0] || !result.rows[0].uuid) {
            throw new HttpError('Failed to create user', 500);
        }
        const createdUserId = result.rows[0].uuid;
        await code('verification', createdUserId);
        return res.status(201).json({ message: 'Sikeres regisztráció. Kérjük, ellenőrizze email címét a fiók aktiválásához.' });
    } catch (err) {
        await client.query('ROLLBACK');
        // map Postgres unique-violation to 409 if not already handled
        if (! (err instanceof HttpError) && err && err.code === '23505') {
            throw new HttpError('Felhasználó már létezik', 409);
        }
        const httpErr = err instanceof HttpError ? err : new HttpError(`${req.method} ${req.originalUrl} - ${err.message}`, err.status || 500);
        throw httpErr;
    } finally {
        client.release();
    }
}