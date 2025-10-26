import fs from 'fs';
import path from 'path';

// 에러 로그 파일 경로 생성 함수
const getErrorLogFilePath = (): string => {
    const now = new Date();
    const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC to KST
    const dateStr = kstDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const logDir = path.join(__dirname, '..', 'log');

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    return path.join(logDir, `log-error-${dateStr}.json`);
};

// 에러 로그 저장 함수
const logError = (error: any, message?: string): void => {
    const currentLogPath = getErrorLogFilePath();
    let logs: object[] = [];
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

    try {
        if (fs.existsSync(currentLogPath)) {
            const fileContent = fs.readFileSync(currentLogPath, 'utf-8');
            logs = JSON.parse(fileContent || '[]');
        }

        console.error(error);

        logs.push({
            timestamp: kstTime,
            message: message || '',
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            } : error,
        });
        fs.writeFileSync(currentLogPath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (err) {
        // 파일 시스템 에러는 콘솔에 출력
        console.error('에러 로그 저장 중 오류 발생:', err);
    }
};

export default logError; 