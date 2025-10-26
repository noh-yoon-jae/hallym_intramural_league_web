import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const env = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "env.json"), "utf-8"));

let pool: mysql.Pool | null = null;

function createDatabasePool(): mysql.Pool {
    return mysql.createPool({
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        // database: env.DB_NAME, // 필요시 주석 해제
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