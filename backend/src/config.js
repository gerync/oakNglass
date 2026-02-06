import config from '../../config.json' assert { type: 'json' };

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
        codesExpiry: config.email.codesExpiry
    },
    security: {
        tokenExpiry: {
            access: config.security.tokenExpiry.access,
            refresh: config.security.tokenExpiry.refresh,
            resetPassword: config.security.tokenExpiry.resetPassword,
        },
        secrets: {
            jwt: config.security.secrets.jwt,
            cookies: config.security.secrets.cookies,
            encryption: config.security.secrets.encryption
        }
    },
    CDN: {
        url: config.CDN.url,
        apiKey: config.CDN.apiKey
    }
};