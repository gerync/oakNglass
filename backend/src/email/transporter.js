import nodemailer from 'nodemailer';
import config from '../config.js';

const transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: config.email.secured(),
    requireTLS: config.email.requireTLS(),
    auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
    }
});

export default transporter;