// #region Imports
import postgre from '../db/pool.js';
import { decryptData } from './security/encrypt.js';
import { hashData } from './security/hash.js';
import { Coloredlog } from '@gerync/utils2';
import config from '../config.js';

import sendEmail from '../email/index.js';
// #endregion

export default async function handleEmailCode(type, userId) {
  // Get a client from the pool for transaction
  const client = await postgre.pool.connect();
    try {
    // normalize type to DB-allowed canonical values
    function resolveType(t) {
      if (!t) return null;
      const asIs = String(t);
      const lowered = asIs.toLowerCase();
      if (['verification','reset','cancel-order','delete-account','admin-invite','journalist-invite'].includes(asIs)) return asIs;
      if (['verification'].includes(lowered)) return 'verification';
      if (lowered.includes('reset')) return 'reset';
      if (lowered.includes('cancel') && lowered.includes('order')) return 'cancel-order';
      if (lowered.includes('delete') && lowered.includes('account')) return 'delete-account';
      if (lowered.includes('admin') && lowered.includes('invite')) return 'admin-invite';
      if (lowered.includes('journalist') && lowered.includes('invite')) return 'journalist-invite';
      // order confirmation variants are not stored in EmailCodes table
      // (they use direct sendEmail calls), so do not map to a DB type here
      return null;
    }

    const ctype = resolveType(type);
    if (!ctype) throw new Error('Ismeretlen email típus');
    // start transaction
    await client.query('BEGIN');

    // #region Read user
    const userRes = await client.query(
      'SELECT fullnameenc, emailenc, hashedpassword FROM users WHERE uuid = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      throw new Error('User not found');
    }
    // #endregion
    // #region Generate code & expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + config.email.codesExpiry);
    // #endregion
    // #region Persist code
    await client.query(
      'DELETE FROM emailcodes WHERE userid = $1 AND type = $2',
      [userId, ctype]
    );
    await client.query(
      'INSERT INTO emailcodes (userid, hashedcode, type, expiresat) VALUES ($1, $2, $3, $4)',
      [userId, hashData(code), ctype, expiry]
    );
    await client.query('COMMIT');
    // #endregion
    // #region Decrypt user data for email content
    const fullName = decryptData(userRes.rows[0].fullnameenc, config.security.secrets.encryption);
    const email = decryptData(userRes.rows[0].emailenc, config.security.secrets.encryption);
    // #endregion
    // #region Build action link
    let link = '';
    if (ctype === 'verification') {
      link = `${config.frontend.domain()}/verify-email?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (ctype === 'reset') {
      link = `${config.frontend.domain()}/reset-password?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (ctype === 'cancel-order') {
      link = `${config.frontend.domain()}/cancel-order?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (ctype === 'delete-account') {
      link = `${config.frontend.domain()}/delete-account?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (ctype === 'admin-invite') {
      link = `${config.frontend.domain()}/admin-invite?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (ctype === 'journalist-invite') {
      link = `${config.frontend.domain()}/journalist-invite?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (ctype === 'orderConfirmation') {
      link = `${config.frontend.domain()}/orders/${userId}?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else {
      throw new Error('Ismeretlen email típus');
    }
    // #endregion
    // #region Send email
    await sendEmail(email, code, ctype, link, fullName);
    // #endregion
    return { code, fullName, email };
  } catch (err) {
    // #region Error handling & rollback
    try { await client.query('ROLLBACK'); } catch (e) {
         Coloredlog('Hiba a tranzakció visszagörgetésekor:', '#fff');
          Coloredlog(e, 'rgb(255, 147, 147)');
     }
    throw err;
    // #endregion
  } finally {
    // Freeing the client
    client.release();
  }
}