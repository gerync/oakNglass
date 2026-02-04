import pool from "../../pool.js";
import argon from "argon2";
import { UserError } from "@gerync/utils2";

export default async function verifyEmailController(req, res) {
    let code = req.code;
    const conn = await pool.getConnection();
    const selectQuery = `SELECT ec.HashedCode, ec.ExpiresAt, u.UserID, u.Email
        FROM emailCodes ec
        JOIN Users u ON ec.UserID = u.UUID
        WHERE ec.Type = 'verification' AND ec.ExpiresAt > NOW()`;
    const [rows] = await conn.query(selectQuery);
    let matchedUser = null;
    rows.forEach(e => {
        if (argon.verify(e.HashedCode, code.toString())) {
            matchedUser = e;
        }
    });
    if (!matchedUser) {
        conn.release();
        throw new UserError('Érvénytelen vagy lejárt kód.', 400);
    }
    const updateQuery = `UPDATE Users SET IsEmailVerified = 1 WHERE UUID = ?`;
    await conn.query(updateQuery, [matchedUser.UserID]);
    const deleteQuery = `DELETE FROM emailCodes WHERE Type = 'verification' AND UserID = ?`;
    await conn.query(deleteQuery, [matchedUser.UserID]);
    conn.release();
    res.status(200).json({ message: 'Email cím sikeresen megerősítve.' });
}