import config from '../../config.js';
import crypto from 'crypto';

function encryptData(data) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(config.security.secrets.encryption, 'hex'), Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decryptData(encryptedData) {
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(config.security.secrets.encryption, 'hex'), Buffer.alloc(16, 0));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export { encryptData, decryptData };
export default { encryptData, decryptData };