import mysql from 'mysql2/promise';

import dotenv from 'dotenv';
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT } = process.env;
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_PORT) {
    throw new Error("Database configuration is not defined in .env");
}

let pool: mysql.Pool | null = null;

function createDatabasePool(): mysql.Pool {
    return mysql.createPool({
        host: DB_HOST!,
        user: DB_USER!,
        password: DB_PASSWORD!,
        port: Number(DB_PORT)!,
        // database: DB_NAME, // 필요시 주석 해제
        waitForConnections: true,
        connectionLimit: 10, // 동시 커넥션 수 조절 가능
        queueLimit: 0,
        timezone: 'Asia/Seoul'
    });
}

export function getDatabaseConnection(): mysql.Pool {
    if (!pool) {
        pool = createDatabasePool();
    }
    return pool;
}

setInterval(async () => {
    console.log('Reconnecting to MySQL pool...');
    if (pool) {
        await pool.end();
        pool = createDatabasePool();
    }
}, 5 * 60 * 60 * 1000); 