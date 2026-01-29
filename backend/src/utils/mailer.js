import nodemailer from 'nodemailer';
import config from '../../../config.json' assert { type: 'json' };
import { Coloredlog } from '@gerync/utils2';


const seced = config.email.smtpPort === 465;
const TLSreq = config.email.smtpPort === 587 || config.email.smtpPort === 465;
const transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: seced,
    requireTLS: TLSreq,
    auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
    }
});

export async function sendEmailWithCode(to, subject, type, code, url) {
    let htmlContent = '';
    if (type === 'verification') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Kérjük, erősítse meg email címét a következő kóddal: <strong>${code}</strong></p>
        <p>Vagy kattintson az alábbi linkre a megerősítéshez:</p>
        <a href="${url}">${url}</a>
        <p>A kód 10 percig érvényes.</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    else if (type === 'reset-password') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Kérjük, állítsa vissza jelszavát a következő kóddal: <strong>${code}</strong></p>
        <p>Vagy kattintson az alábbi linkre a jelszó visszaállításához:</p>
        <a href="${url}">${url}</a>
        <p>A kód 10 percig érvényes.</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    else if (type === 'cancel-order') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Kérjük, erősítse meg rendelésének lemondását a következő kóddal: <strong>${code}</strong></p>
        <p>Vagy kattintson az alábbi linkre a lemondás megerősítéséhez:</p>
        <a href="${url}">${url}</a>
        <p>A kód 10 percig érvényes.</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    else if (type === 'delete-account') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Kérjük, erősítse meg fiókja törlését a következő kóddal: <strong>${code}</strong></p>
        <p>Vagy kattintson az alábbi linkre a fiók törlésének megerősítéséhez:</p>
        <a href="${url}">${url}</a>
        <p>A kód 10 percig érvényes.</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    const mailOptions = {
        from: `"${config.email.alias.name}" <${config.email.alias.address}>`,
        to: to,
        subject: subject,
        html: htmlContent
    };
    await transporter.sendMail(mailOptions);
}

export async function sendwithoutCode(to, subject, type, content) {
    let htmlContent = '';
    if (type === 'order-confirmation') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Köszönjük rendelését! Rendelésének részletei a következők:</p>
        <p>${
        content.orderedItems.forEach(e => {
            return `Termék: ${e.productName}, Mennyiség: ${e.quantity}, Ár: ${e.priceHUF} HUF<br/>`;
        })
        }</p>
        <p>Összesen fizetendő: <strong>${content.totalPriceHUF} HUF</strong></p>
        <p>Rendelésének állapota: <strong>${content.orderStatus}</strong></p>
        <p>Szállítási cím: ${content.shipmentAddress}</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    if (type === 'order-shipped') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Rendelése elküldésre került! Rendelésének részletei a következők:</p>
        <p>Rendelés azonosító: <strong>${content.orderID}</strong></p>
        <p>Összesen fizetendő: <strong>${content.totalPriceHUF} HUF</strong></p>
        <p>Szállítási cím: ${content.shipmentAddress}</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    if (type === 'order-delivered') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Rendelése kézbesítésre került! Rendelésének részletei a következők:</p>
        <p>Rendelés azonosító: <strong>${content.orderID}</strong></p>
        <p>Összesen fizetendő: <strong>${content.totalPriceHUF} HUF</strong></p>
        <p>Szállítási cím: ${content.shipmentAddress}</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    if (type === 'order-canceled') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Rendelése lemondásra került! Rendelésének részletei a következők:</p>
        <p>Rendelés azonosító: <strong>${content.orderID}</strong></p>
        <p>Összesen fizetendő: <strong>${content.totalPriceHUF} HUF</strong></p>
        <p>Szállítási cím: ${content.shipmentAddress}</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    if (type === 'password-changed') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Jelszava sikeresen megváltoztatásra került. Ha nem Ön kezdeményezte a változtatást, kérjük, lépjen kapcsolatba ügyfélszolgálatunkkal azonnal.</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    if (type === 'account-deleted') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Fiókja sikeresen törlésre került. Sajnáljuk, hogy el kell köszönnünk Önt. Ha meggondolja magát, mindig újra regisztrálhat nálunk.</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    if (type === 'new-product') {
        htmlContent = `<p>Kedves Felhasználó!</p>
        <p>Örömmel értesítjük, hogy új termék érkezett kínálatunkba: <strong>${content.productName}</strong>. Nézze meg weboldalunkon a részleteket!</p>
        <p>Üdvözlettel,<br/>OakNGlass Csapat</p>`;
    }
    const mailOptions = {
        from: `"${config.email.alias.name}" <${config.email.alias.address}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject: subject,
        html: htmlContent
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        Coloredlog('Email küldési hiba:', '#ffa600');
        Coloredlog(error.message, '#ff0000');
    }
}