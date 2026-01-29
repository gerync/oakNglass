import { UserError } from '@gerync/utils2';
export default function registerMiddleware(req, res, next) {
    const body = req.body;
    if (!body.fullname || !body.email || !body.password || !body.birthdate || body.emailsubscribed === undefined ) {
        throw new UserError('Hiányzó mező(k)!', 400);
    }
    if (Object.keys(body).length > 7) {
        throw new UserError('Túl sok mező került elküldésre!', 400);
    }
    if (Object.keys(body).length < 5) {
        throw new UserError('Túl kevés mező került elküldésre!', 400);
    }
    if (Object.keys(body).some(key => !['fullname', 'email', 'password', 'birthdate', 'mobileNumber', 'address', 'emailsubscribed'].includes(key))) {
        throw new UserError('Érvénytelen mező(k)!', 400);
    }
    if (typeof body.fullname !== 'string' || typeof body.email !== 'string' || typeof body.password !== 'string' || typeof body.birthdate !== 'string' ) {
        throw new UserError('Érvénytelen mező típus!', 400);
    }
    if (body.mobileNumber && typeof body.mobileNumber !== 'string') {
        throw new UserError('Érvénytelen mező típus!', 400);
    }
    if (body.address && typeof body.address !== 'string') {
        throw new UserError('Érvénytelen mező típus!', 400);
    }
    if (typeof body.emailsubscribed !== 'boolean') {
        try {
            body.emailsubscribed = body.emailsubscribed.toBoolean();
        } catch {
            throw new UserError('Érvénytelen mező típus!', 400);
        }
    }
    const FullNameRegex = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s'-]{2,125}$/;
    const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const MobileNumberRegex = /^\+?[0-9]{7,15}$/;
    if (!FullNameRegex.test(body.fullname)) {
        throw new UserError('Érvénytelen teljes név!', 400);
    }
    if (!EmailRegex.test(body.email)) {
        throw new UserError('Érvénytelen email cím!', 400);
    }
    if (body.mobileNumber && !MobileNumberRegex.test(body.mobileNumber)) {
        throw new UserError('Érvénytelen mobil szám!', 400);
    }
    const BirthDate = new Date(body.birthdate);
    if (isNaN(BirthDate.getTime())) {
        throw new UserError('Érvénytelen születési dátum!', 400);
    }
    const Today = new Date();
    const Age = Today.getFullYear() - BirthDate.getFullYear();
    const MonthDiff = Today.getMonth() - BirthDate.getMonth();
    if (MonthDiff < 0 || (MonthDiff === 0 && Today.getDate() < BirthDate.getDate())) {
        Age--;
    }
    if (Age < 18) {
        throw new UserError('Csak 18 éven felüliek regisztrálhatnak!', 400);
    }
    const PR = {
        length: /^.{8,}$/,
        uppercased: /^(?=.*[A-Z]).{8,}$/,
        lowercased: /^(?=.*[a-z]).{8,}$/,
        number: /^(?=.*\d).{8,}$/,
        special: /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    };
    if (!PR.length.test(body.password)) {
        throw new UserError('A jelszónak legalább 8 karakter hosszúnak kell lennie!', 400);
    }
    if (!PR.uppercased.test(body.password)) {
        throw new UserError('A jelszónak tartalmaznia kell legalább egy nagybetűt!', 400);
    }
    if (!PR.lowercased.test(body.password)) {
        throw new UserError('A jelszónak tartalmaznia kell legalább egy kisbetűt!', 400);
    }
    if (!PR.number.test(body.password)) {
        throw new UserError('A jelszónak tartalmaznia kell legalább egy számot!', 400);
    }
    if (!PR.special.test(body.password)) {
        throw new UserError('A jelszónak tartalmaznia kell legalább egy speciális karaktert!', 400);
    }
    const addressRegex = /^.{5,255}$/;
    if (body.address && !addressRegex.test(body.address)) {
        throw new UserError('Érvénytelen cím!', 400);
    }
    if (body.emailsubscribed !== undefined && typeof body.emailsubscribed !== 'boolean') {
        throw new UserError('Érvénytelen email feliratkozás érték!', 400);
    }
    if (!body.emailsubscribed) {
        body.emailsubscribed = false;
    }
    if (!body.mobileNumber) {
        body.mobileNumber = null;
    }
    next();
}