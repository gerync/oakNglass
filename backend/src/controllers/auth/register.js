import pool from "../../pool.js";
import argon from "argon2";
import { hashData, encryptData } from "@gerync/utils2";
import { sendEmailWithCode } from "../../utils/mailer.js";

export default async function registerController(req, res) {
    const { fullname, email, password, birthdate, mobileNumber, address, emailsubscribed } = req.body;
    const hashedFullName = hashData(fullname);
    const conn = await pool.getConnection();
    const hashedEmail = hashData(email.toLowerCase());
    let hashedMobileNumber = null;
    if (mobileNumber) {
        hashedMobileNumber = hashData(mobileNumber);
    }
    const hashedPassword = await argon.hash(password);
    const birthDateObj = new Date(birthdate);
    
    const insertQuery = `INSERT INTO Users 
        (FullName, HashedFullName, Email, HashedEmail, MobileNumber, HashedMobileNumber, HashedPassword, BirthDate, Address, EmailSubscribed) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertValues = [
        encryptData(fullname),
        hashedFullName,
        encryptData(email.toLowerCase()),
        hashedEmail,
        mobileNumber ? encryptData(mobileNumber): null,
        hashedMobileNumber,
        hashedPassword,
        birthDateObj,
        address ? encryptData(address) : null,
        emailsubscribed
    ];
    await conn.query(insertQuery, insertValues);
    const Code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await argon.hash(Code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const insertemailCode = `INSERT INTO emailCodes (UserID, HashedCode, ExpiresAt, Type) VALUES ((SELECT UUID FROM Users WHERE HashedEmail = ?), ?, ?, 'verification')`;
    conn.query(insertemailCode, [hashedEmail, hashedCode, expiresAt]);

    await sendEmailWithCode(email, "Email cím megerősítése", "verification", Code, `https://oak.gerync.com/verify-email?code=${Code}`);

    conn.release();
    res.status(201).json({ message: "Erősítse meg az email címét a regisztráció befejezéséhez." });
}