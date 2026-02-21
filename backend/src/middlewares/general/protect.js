import jwt from 'jsonwebtoken';
import HttpError from '../../models/httpError.js';
import config from '../../config.js';
import { pool } from '../../db/pool.js';

export default async function ProtectMiddleware(req, res, next) {
  // #region extract tokens
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  if (!accessToken && !refreshToken) invalid('Érvénytelen munkamenet', 401);

  let client;
  try {
    client = await pool.connect();
    // #endregion

    // #region verify access token
    if (accessToken) {
        try {
        const decoded = jwt.verify(accessToken, config.security.secrets.jwt);
        req.user = decoded;
        return next();
        } catch (err) {
        if (err.name !== 'TokenExpiredError') throw err;
        }
    }
    // #endregion

    // #region verify refresh token
    if (!refreshToken) {
        invalid('Nincs refresh token', 401);
        }
    let decodedRefresh;
    try {
        decodedRefresh = jwt.verify(refreshToken, config.security.secrets.jwt2);
    } catch (e) {
        invalid('Érvénytelen refresh token', 401);
    }
    // #endregion

    // #region validate refresh token in DB by tokenid
    const tokenId = decodedRefresh.tokenid;
    if (!tokenId) invalid('Érvénytelen refresh token (tokenid hiányzik)', 401);

    const { rows } = await client.query(
        'SELECT tokenuserid AS userid, accessversion, expiresat, revoked FROM refreshtokens WHERE tokenid = $1 LIMIT 1',
        [tokenId]
    );
    if (rows.length === 0) invalid('Munkamenet nincs az adatbázisban', 401);

    const tokenRow = rows[0];
    if (tokenRow.revoked) invalid('Munkamenet visszavonva', 401);
    if (new Date(tokenRow.expiresat) < new Date()) invalid('Munkamenet lejárt', 401);
    if (tokenRow.accessversion !== decodedRefresh.accessversion) invalid('Érvénytelen hitelesítés', 401);
    // #endregion

    // #region new access token
    
    const userRes = await client.query('SELECT role FROM users WHERE uuid = $1', [tokenRow.userid]);
    const role = userRes.rows[0] ? userRes.rows[0].role : 'user';

    const accessPayload = { uuid: tokenRow.userid, role, version: tokenRow.accessversion };
    const accessMs = config.security.tokenExpiry.access;
    const newAccessToken = jwt.sign(accessPayload, config.security.secrets.jwt, { expiresIn: Math.floor(accessMs / 1000) });

    res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: accessMs
    });
    // #endregion

    // #region finalize
    req.user = accessPayload;
    return next();
    // #endregion
    } catch (err) {
        const httpErr = err instanceof HttpError ? err : new HttpError(`${req.method} ${req.originalUrl} - ${err.message}`, err.status || 500);
        throw httpErr;
    }
    finally {
        if (client) client.release();
    }
}

function invalid(message, status) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('loggedIn');
    throw new HttpError(message || 'Érvénytelen munkamenet', status || 401);
}


export function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    throw new HttpError('Nincs jogosultságod a művelet végrehajtásához', 403);
}

export function isJournalist(req, res, next) {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'journalist')) {
        return next();
    }
    throw new HttpError('Nincs jogosultságod a művelet végrehajtásához', 403);
}