import mysql from 'mysql2/promise';
import configs from '../../config.json' assert { type: 'json' };

const dbConfig = {
    host: configs.db.host,
    user: configs.db.user,
    password: configs.db.password,
    database: configs.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export default pool;