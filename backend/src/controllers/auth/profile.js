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
        const mobileNumber = decryptData(user.mobilenumberenc);
            if (mobileNumber) {
                user.mobilenumber = mobileNumber.length === 11
                    ? mobileNumber.replace(/(\d{2})(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4')
                    : mobileNumber;
            } else {
                user.mobilenumber = null;
            }
        
        function formatDate(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}. ${month}. ${day}.`;
        }
        user.birthdate = formatDate(user.birthdate);
        user.createdat = formatDate(user.createdat);
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