// #region Imports and config
import config from "../config.js";
// #endregion

// #region Theme constants
// Colors
const MAROON = '#7B1414';
const PALE_PINK = '#F7E6E6';
const CARD_BG = '#ffffff';
// #endregion

// #region Helpers: HTML builders
// Creates the full email HTML layout and inserts greeting/title/body pieces
function wrapHtml(title, codeHtml, actionHtml, fullName) {
    const greeting = fullName
        ? `<p style="font-size:14px;color:#444;margin-bottom:8px;">Kedves ${fullName}!</p>`
        : `<p style="font-size:14px;color:#444;margin-bottom:8px;">Kedves Felhasználó!</p>`;
    const calc = function() {
        // normalize value to seconds
        let totalSeconds = config.email.codesExpiry;
        if (typeof totalSeconds === 'number' && totalSeconds > 1000) totalSeconds = Math.floor(totalSeconds / 1000);
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 'érvénytelen időtartam.';

        // time constants
        const MIN = 60;
        const HOUR = 60 * MIN;
        const DAY = 24 * HOUR;
        const WEEK = 7 * DAY;
        const MONTH = 30 * DAY;

        // compute components
        const months = Math.floor(totalSeconds / MONTH);
        let rem = totalSeconds % MONTH;
        const weeks = Math.floor(rem / WEEK);
        rem %= WEEK;
        const days = Math.floor(rem / DAY);
        rem %= DAY;
        const hours = Math.floor(rem / HOUR);
        rem %= HOUR;
        const minutes = Math.floor(rem / MIN);
        const seconds = rem % MIN;

        // format output with a smaller unit when relevant
        if (months > 0) return months + (weeks > 0 ? ` hónap ${weeks} hétig érvényes.` : ' hónapig érvényes.');
        if (weeks > 0) return weeks + (days > 0 ? ` hét ${days} napig érvényes.` : ' hétig érvényes.');
        if (days > 0) return days + (hours > 0 ? ` nap ${hours} óráig érvényes.` : ' napig érvényes.');
        if (hours > 0) return hours + (minutes > 0 ? ` óra ${minutes} percig érvényes.` : ' óráig érvényes.');
        if (minutes > 0) return `${minutes} percig érvényes.`;
        return `${seconds} másodpercig érvényes.`;
    };
    return `
        <div style="background:${PALE_PINK};padding:24px;font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;">
            <div style="max-width:600px;margin:0 auto;background:${CARD_BG};border-radius:8px;overflow:hidden;border:1px solid rgba(0,0,0,0.05);">
                <div style="background:${MAROON};color:#fff;padding:14px 20px;font-weight:700;font-size:18px;text-align:center;">Oak &amp; Glass</div>
                <div style="padding:20px;color:#333;">
                    ${greeting}
                    <h3 style="margin-top:0;color:${MAROON};">${title}</h3>
                    <div style="margin:16px 0;">${codeHtml}</div>
                    <div style="margin:20px 0;">${actionHtml}</div>
                    <p style="font-size:13px;color:#666;margin-top:18px;">A kód ${calc()}</p>
                    <p style="font-size:13px;color:#666;">Ha nem te kezdeményezted ezt az akciót, kérjük, hagyd figyelmen kívül ezt az üzenetet.</p>
                    <p style="font-size:13px;color:#666;margin-top:12px;">Üdvözlettel,<br>Az Oak N Glass csapata</p>
                </div>
            </div>
        </div>
    `;
}

// Small building blocks used inside the layout
function codeBlock(code) {
    return `<div style="display:inline-block;padding:12px 18px;background:#fff;border:2px dashed ${MAROON};border-radius:6px;font-size:20px;color:${MAROON};font-weight:700;letter-spacing:2px;">${code}</div>`;
}

function actionButton(text, link) {
    const href = link || '#';
    return `<a href="${href}" style="display:inline-block;padding:12px 18px;background:${MAROON};color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">${text}</a>`;
}
// #endregion

// #region Templates: email types
const EmailContent = {
    verification: {
        subject: "Erősítsd meg az email címed - Oak N Glass",
        html: (code, link, fullName) => wrapHtml(
            'Erősítsd meg az email címed',
            codeBlock(code),
            actionButton('Email megerősítése', link),
            fullName
        ),
    },
    resetPassword: {
        subject: "Jelszó visszaállítási kód - Oak N Glass",
        html: (code, link, fullName) => wrapHtml(
            'Jelszó visszaállítása',
            codeBlock(code),
            actionButton('Jelszó visszaállítása', link),
            fullName
        ),
    },
    cancelOrder: {
        subject: "Rendelés lemondási kód - Oak N Glass",
        html: (code, link, fullName) => wrapHtml(
            'Rendelés lemondása',
            codeBlock(code),
            actionButton('Rendelés lemondása', link),
            fullName
        ),
    },
    deleteAccount: {
        subject: "Fiók törlési kód - Oak N Glass",
        html: (code, link, fullName) => wrapHtml(
            'Fiók törlése',
            codeBlock(code),
            actionButton('Fiók törlése', link),
            fullName
        ),
    },
    adminInvite: {
        subject: "Admin meghívó - Oak N Glass",
        html: (code, link, fullName) => wrapHtml(
            'Admin meghívó',
            `<p style="margin:0 0 8px 0;color:#444;">Meghívást kaptál az admin csapatba. Kattints az elfogadáshoz:</p>`,
            actionButton('Meghívó elfogadása', link),
            fullName
        ),
    },
    journalistInvite: {
        subject: "Újságíró meghívó - Oak N Glass",
        html: (code, link, fullName) => wrapHtml(
            'Újságíró meghívó',
            `<p style="margin:0 0 8px 0;color:#444;">Meghívást kaptál az újságírói csapatba. Kattints az elfogadáshoz:</p>`,
            actionButton('Meghívó elfogadása', link),
            fullName
        ),
    },
};
// #endregion


/* Build an email payload from a template key.
 - `templateKey`: one of the keys in `EmailContent` (e.g. 'verification').
 - `code`: short code inserted into the template (optional).
 - `link`: action URL inserted into the template (optional).
 - `fullName`: recipient name used for a personalized greeting (optional).
 Returns an object with `{ subject, html }` ready to send.
 */
export function buildEmail(templateKey, { code = '', link = '', fullName = '' } = {}) {
    const tpl = EmailContent[templateKey];
    if (!tpl) throw new Error(`Unknown email template: ${templateKey}`);
    const subject = tpl.subject || '';
    let html;
    if (typeof tpl.html === 'function') {
        // Templates are functions that accept (code, link, fullName)
        html = tpl.html(code, link, fullName);
    } else if (typeof tpl.html === 'string') {
        // Fall back for string-based templates: simple placeholder replacement
        html = tpl.html.replace(/{{CODE}}/g, code).replace(/{{LINK}}/g, link).replace(/{{FULLNAME}}/g, fullName);
    } else {
        html = '';
    }
    return { subject, html };
}

/* Build a simple newsletter email highlighting a newly added product.
 - `fullName`: recipient name used in the greeting.
 - `newProductID`: product id to link to on the frontend.
 Returns `{ subject, html }` ready to send. */
export function NewsLetter(fullName, newProductID) {
    const subject = "Újdonságok az OakNGlass-nál!";
    const html = wrapHtml(
        'Fedezd fel legújabb termékeinket!',
        `<p style="margin:0 0 12px 0;color:#444;">Kedves ${fullName}!</p>
        <p style="margin:0 0 12px 0;color:#444;">Örömmel mutatjuk be legújabb termékeinket,
        amelyek most érkeztek meg az OakNGlass kínálatába. Nézd meg őket a weboldalunkon!</p>`,
        actionButton('Fedezd fel az újdonságokat', `${config.frontend.domain()}/products/${newProductID}`),
        fullName
    );
    return { subject, html };
}

export default EmailContent;
