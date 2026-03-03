import config from '../../config.js';
import crypto from 'crypto';

function deriveKey(secret) {
    return crypto.createHash('sha256').update(String(secret)).digest();
}

function encryptData(data) {
    const key = deriveKey(config.security.secrets.encryption);
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decryptData(encryptedData) {
    if (encryptedData === null || encryptedData === undefined) {
        return null;
    }
    
    // BYTEA columns come back from node-postgres as Buffers containing the
    // ASCII/UTF-8 bytes of the hex string we originally stored, so we must
    // convert with 'utf8' (not 'hex') to recover the original cipher-text.
    const encryptedHex = Buffer.isBuffer(encryptedData)
        ? encryptedData.toString('utf8')
        : String(encryptedData);

    // Empty string => nothing to decrypt
    if (encryptedHex.length === 0) {
        return '';
    }

    // Validate hex string length
    if (encryptedHex.length % 2 !== 0) {
        throw new Error(`Invalid encrypted data: hex string must have even length, got ${encryptedHex.length} characters: "${encryptedHex}"`);
    }

    const key = deriveKey(config.security.secrets.encryption);
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export { encryptData, decryptData };
export default { encryptData, decryptData };