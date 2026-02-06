// #region Imports
import postgre from '../db/pool.js';
import { decrypt, hashPassword,  Coloredlog} from '@gerync/utils2';
import config from '../config.js';

import sendEmail from '../email/index.js';
// #endregion

export default async function handleEmailCode(type, userId) {
  // Get a client from the pool for transaction
  const client = await postgre.pool.connect();
  try {
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
      'INSERT INTO emailcodes (userid, hashedcode, type, expiresat) VALUES ($1, $2, $3, $4)',
      [userId, await hashPassword(code), type, expiry]
    );
    await client.query('COMMIT');
    // #endregion
    // #region Decrypt user data for email content
    const fullName = decrypt(userRes.rows[0].fullnameenc, config.security.secrets.encryption);
    const email = decrypt(userRes.rows[0].emailenc, config.security.secrets.encryption);
    // #endregion
    // #region Build action link
    let link = '';
    if (type === 'verification') {
        link = `${config.frontend.domain()}/verify-email?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (type === 'reset') {
        link = `${config.frontend.domain()}/reset-password?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (type === 'cancel-order') {
        link = `${config.frontend.domain()}/cancel-order?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (type === 'delete-account') {
        link = `${config.frontend.domain()}/delete-account?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (type === 'admin-invite') {
        link = `${config.frontend.domain()}/admin-invite?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else if (type === 'journalist-invite') {
        link = `${config.frontend.domain()}/journalist-invite?code=${code}&email=${encodeURIComponent(email)}`;
    }
    else {
        throw new Error('Unknown email code type');
    }
    // #endregion
    // #region Send email
    await sendEmail(email, code, type, link, fullName);
    // #endregion
    return { code, fullName, email };
  } catch (err) {
    // #region Error handling & rollback
    try { await client.query('ROLLBACK'); } catch (e) {
         Coloredlog(['Error rolling back transaction:', e ], ['#fff', '#f00'] );
     }
    throw err;
    // #endregion
  } finally {
    // Freeing the client
    client.release();
  }
}