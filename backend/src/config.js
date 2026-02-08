import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
const configPath = path.join(__dirname, '../../config.json');

let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

fs.watchFile(configPath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        try {
            const newConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            config = newConfig;
            console.log('Config fájl újratöltve');
        }
        catch (err) {
            console.error('Hiba a config fájl újratöltésekor:', err);
        }
    }
});

export default {
    backend: {
        host: config.backend.host,
        port: config.backend.port,
            domain: function() {
            if (!this.host.includes('localhost')) {
                return `https://${this.host}`;
            }
            return `http://${this.host}:${this.port}`;
        }
    },
    frontend: {
        host: config.frontend.host,
        port: config.frontend.port,
        domain: function() {
            if (!this.host.includes('localhost')) {
                return `https://${this.host}`;
            }
            return `http://${this.host}:${this.port}`;
        }   
    },
    database: {
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        dbname: config.database.dbname,
        maxConnections: config.database.maxConnections,
        ssl: config.database.ssl
    },
    email: {
        smtpHost: config.email.smtpHost,
        smtpPort: config.email.smtpPort,
        auth: {
            user: config.email.auth.user,
            pass: config.email.auth.pass
        },
        secured: function() {
            return this.smtpPort === 465;
        },
        requireTLS: function() {
            return this.smtpPort === 587;
        },
        alias: {
            name: config.email.alias.name,
            address: config.email.alias.address
        },
        codesExpiry: TimeConverter(config.email.codesExpiry)
    },
    security: {
        tokenExpiry: {
            access: TimeConverter(config.security.tokenExpiry.access),
            refresh: TimeConverter(config.security.tokenExpiry.refresh),
            resetPassword: TimeConverter(config.security.tokenExpiry.resetPassword),
        },
        secrets: {
            jwt: (function() {
                if (config.security.secrets.jwt) return config.security.secrets.jwt;
                return crypto.randomBytes(32).toString('hex');
            })(),
            jwt2: (function() {
                if (config.security.secrets.jwt2) return config.security.secrets.jwt2;
                return crypto.randomBytes(32).toString('hex');
            })(),
            cookies: (function() {
                if (config.security.secrets.cookies) return config.security.secrets.cookies;
                return crypto.randomBytes(32).toString('hex');
            })(),
            encryption: (function() {
                if (config.security.secrets.encryption) return config.security.secrets.encryption;
                return crypto.randomBytes(32).toString('hex');
            })(),
            salt: (function() {
                if (config.security.secrets.salt) return config.security.secrets.salt;
                return crypto.randomBytes(16).toString('hex');
            })(),
        }
    },
    CDN: {
        url: config.CDN.url,
        apiKey: config.CDN.apiKey
    }
};

function TimeConverter(time) {
    // #region Input handling
    if (typeof time === 'number') return time;
    if (typeof time !== 'string') throw new Error('TimeConverter: a paraméter string vagy szám kell legyen');

    const trimmed = time.trim();
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    // #endregion
    // #region Units definition
    const UNITS = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
        M: 30 * 24 * 60 * 60 * 1000
    };
    // #endregion
    // #region Parsing compound durations
    const re = /(\d+)\s*([smhdwM])/g;
    let match;
    let total = 0;
    let found = false;
    while ((match = re.exec(trimmed)) !== null) {
        found = true;
        const val = parseInt(match[1], 10);
        const unit = match[2];
        const mul = UNITS[unit];
        if (!mul) throw new Error(`Érvénytelen időegység: ${unit}`);
        total += val * mul;
    }

    if (!found) throw new Error(`Érvénytelen időformátum: ${time}`);
    return total;
    // #endregion
}