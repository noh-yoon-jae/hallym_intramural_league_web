import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// 로그 파일 경로 설정 함수
const getLogFilePath = (): string => {
    const now = new Date();
    const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC to KST
    const dateStr = kstDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const logDir = path.join(__dirname, '..', 'log');

    // 로그 디렉토리가 없으면 생성
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    return path.join(logDir, `log-${dateStr}.json`);
};

// 로그 저장 함수
const saveLogToFile = (logData: object): void => {
    const currentLogPath = getLogFilePath();
    let logs: object[] = [];

    try {
        if (fs.existsSync(currentLogPath)) {
            const fileContent = fs.readFileSync(currentLogPath, 'utf-8');
            logs = JSON.parse(fileContent || '[]');
        }

        logs.push(logData);
        fs.writeFileSync(currentLogPath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (error) {
        console.error('로그 저장 중 오류 발생:', error);
    }
};

// 요청 로거 미들웨어
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const method = req.method;
    const url = req.url;
    const ip = req.ip;
    const now = new Date();
    const kstTime = now.toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    console.log({
        ip,
        request: {
            url,
            method,
        },
        timestamp: kstTime,
    });
    saveLogToFile({
        ip,
        request: {
            url,
            method,
            body: req.body,
            headers: req.headers,
        },
        timestamp: kstTime,
    });
    next();
};
