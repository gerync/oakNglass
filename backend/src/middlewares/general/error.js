import { Coloredlog } from "@gerync/utils2";


export default function ErrorHandlerMiddleware(err, req, res, next) {
    let status = err && (err.status || err.statusCode);
    const rawMessage = (err && err.message) || 'Internal Server Error';
    if (!status) {
        const m = rawMessage.match(/[,\s]+(\d{3})$/);
        if (m) status = parseInt(m[1], 10);
    }
    status = status || 500;

    let message = rawMessage;
    const sep = ' - ';
    if (rawMessage.includes(sep)) message = rawMessage.split(sep).slice(1).join(sep).trim();


    if (err && err.code === '23505') {
        let field;
        if (err.detail) {
            const m = err.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
            if (m && m[1]) field = m[1];
        }
        if (!field && err.constraint) {
            const parts = err.constraint.split('_');
            const keyIdx = parts.indexOf('key');
            if (keyIdx > 0) field = parts[keyIdx - 1];
            else field = parts[parts.length - 1];
        }
        const clientMsg = field ? `${field} már létezik` : 'Duplikált bejegyzés';
        return res.status(409).json({ error: clientMsg });
    }
    if (status >= 500) {
        Coloredlog(err, '#ff5555');
        return res.status(status).json({ error: 'Belső szerverhiba' });
    }

    return res.status(status).json({ error: message });
}
