import transporter from "./transporter.js";
import { buildEmail } from "./content.js";
import config from "../config.js";


export default async function sendEmail(to, code, type, link, fullName) {
    const { subject, html } = buildEmail(type, { code, link, fullName });
    const mailOptions = {
        from: `"${config.email.alias.name}" <${config.email.alias.address}>`,
        to,
        subject,
        html
    };
    return await transporter.sendMail(mailOptions);
}