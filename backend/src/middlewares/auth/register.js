import { UserTemp } from '../../models/user.js';
import HttpError from '../../models/httpError.js';

export default function RegisterMiddleware(req, res, next) {
    let user = new UserTemp(
        req.body.fullName,
        req.body.email,
        req.body.mobile || null,
        req.body.password,
        req.body.birthdate,
        req.body.address || null
    );
    let emailSubscribe = req.body.emailSubscribe || true;
    if (!user.fullName) throw new HttpError('Név megadása kötelező', 400);
    if (!user.email) throw new HttpError('Email cím megadása kötelező', 400);
    if (!user.password) throw new HttpError('Jelszó megadása kötelező', 400);
    if (!user.birthdate) throw new HttpError('Születési dátum megadása kötelező', 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\+?[0-9]{7,15}$/;
    const passwordRegex = {
        length: /^.{8,}$/,
        lowercase: /[a-z]/,
        uppercase: /[A-Z]/,
        digit: /[0-9]/,
        special: /[!@#$%^&*(),.?":{}|<>]/
    }
    if (!emailRegex.test(user.email)) throw new HttpError('Érvénytelen email formátum', 400);
    if (user.mobile && !mobileRegex.test(user.mobile)) throw new HttpError('Érvénytelen telefonszám formátum', 400);
    if (!passwordRegex.length.test(user.password)) throw new HttpError('A jelszónak legalább 8 karakter hosszúnak kell lennie', 400);
    if (!passwordRegex.lowercase.test(user.password)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy kisbetűt', 400);
    if (!passwordRegex.uppercase.test(user.password)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy nagybetűt', 400);
    if (!passwordRegex.digit.test(user.password)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy számjegyet', 400);
    if (!passwordRegex.special.test(user.password)) throw new HttpError('A jelszónak tartalmaznia kell legalább egy speciális karaktert', 400);

    if (typeof emailSubscribe !== 'boolean') {
        if (emailSubscribe === 'true') emailSubscribe = true;
        else if (emailSubscribe === 'false') emailSubscribe = false;
        else throw new HttpError('Érvénytelen érték az emailSubscribe mezőben', 400);
    }
    try {
        const birthDateObj = new Date(user.birthdate);
        if (isNaN(birthDateObj.getTime())) {
            throw new HttpError('Érvénytelen születési dátum formátum', 400);
        }
        
        const now = new Date();
        const age = now.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = now.getMonth() - birthDateObj.getMonth();
        const dayDiff = now.getDate() - birthDateObj.getDate();
        if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
            throw new HttpError('A regisztrációhoz legalább 18 évesnek kell lenned', 400);
        }
    } catch (err) {
        throw new HttpError('Érvénytelen születési dátum formátum', 400);
    }
    req.userTemp = user;
    req.emailSubscribe = emailSubscribe;
    next();
}