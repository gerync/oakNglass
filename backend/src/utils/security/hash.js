import crypto from 'crypto';
import config from '../../config.js';
import argon from 'argon2';

function hashData(data) {
    let hash = crypto.createHash('sha256');
    hash.update(config.security.secrets.salt + data);
    return hash.digest('hex');
}

function compareHash(data, hash) {
    const dataHash = hashData(data);
    const hashBuffer = Buffer.from(hash);
    const dataHashBuffer = Buffer.from(dataHash);
    if (dataHashBuffer.length !== hashBuffer.length) {
        return false;
    }
    return crypto.timingSafeEqual(dataHashBuffer, hashBuffer);
}

async function hashPassword(password) {
    return await argon.hash(password);
}

async function verifyPassword(password, hashedPassword) {
    return await argon.verify(hashedPassword, password);
}


export { hashData, compareHash, hashPassword, verifyPassword };
export default { hashData, compareHash, hashPassword, verifyPassword };