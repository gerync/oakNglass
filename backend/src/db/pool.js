import { Pool } from 'pg';
import configs from '../../config.json' assert { type: 'json' };

const dbConfig = {
    host: configs.database.host,
    user: configs.database.username,
    password: configs.database.password,
    database: configs.database.dbname,
    port: configs.database.port || 5432,
    max: configs.database.maxConnections || 10,
    ssl: configs.database.ssl || false
};

const pool = new Pool(dbConfig);

async function query(sql, params = []) {
    const res = await pool.query(sql, params);
    return [res.rows, []];
}

async function execute(sql, params = []) {
    const res = await pool.query(sql, params);
    return [res.rows, []];
}

export default {
    query,
    execute,
    pool,
    config: dbConfig
};