import HttpError from '../../models/httpError.js';
import { pool } from '../../db/pool.js';
import { decryptData } from '../../utils/security/encrypt.js';

export default async function getProfile(req, res, next) {
    const userid = req.user.uuid;

    let client;
    try {
        client = await pool.connect();
        
        const { rows } = await client.query(
            'SELECT uuid, emailenc, fullnameenc, addressenc, createdat, birthdate, mobilenumberenc, role FROM users WHERE uuid = $1 LIMIT 1',
            [userid]
        );
        if (rows.length === 0) throw new HttpError('Felhasználó nem található', 404);

        const user = rows[0];
        user.email = decryptData(user.emailenc);
        user.fullname = decryptData(user.fullnameenc);
        user.address = decryptData(user.addressenc);
        user.mobilenumber = decryptData(user.mobilenumberenc);

        res.json({ 
            user: {
            uuid: user.uuid,
            email: user.email,
            fullname: user.fullname,
            address: user.address,
            mobile: user.mobilenumber,
            createdAt: user.createdat,
            birthdate: user.birthdate,
            role: user.role
        }});
    }
    catch (err) {
        console.error('Error fetching user profile:', err);
        next(new HttpError('Hiba történt a profil lekérése során', 500));
    }
    finally {
        if (client) client.release();
    }
}