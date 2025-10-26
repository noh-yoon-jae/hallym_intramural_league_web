import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import crypto from 'crypto';
import axios from 'axios';
import qs from 'qs';
import os from 'os';

export function validateUsername(username: string): boolean {
    return typeof username === 'string'
        && username.length <= 20
        && !/[<>]/.test(username);
}

export function validatePassword(password: string): boolean {
    return typeof password === 'string'
        && password.length >= 8
        && /[A-Z]/.test(password)
        && /[0-9]/.test(password);
}

export function validateEmail(email: string): boolean {
    // 이메일이 문자열이고, @hallym.ac.kr로 끝나는지 검사
    return typeof email === 'string'
        && /^[^\s@]+@hallym\.ac\.kr$/.test(email);
}

export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}


export async function hakbunSearch_v1(frontJumin: string, backJumin: string): Promise<{ hakbun: string, name: string, grade: string, academicStatus: string, undergraduate: string, major: string }> {
    const data = { frontJumin, backJumin };

    const response = await axios.post(
        'https://was1.hallym.ac.kr:8081/HLMS/haksa/hakjuk/hakbun_search.jsp',
        qs.stringify(data),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            responseType: 'arraybuffer', // 바이너리 데이터로 받기
        }
    );

    // EUC-KR 디코딩
    const decodedData = iconv.decode(response.data, 'euc-kr');

    // HTML 파싱
    const $ = cheerio.load(decodedData);

    // 학번, 이름, 학년 추출 ( 학교 상황에 따라 바뀔 수 있음 )
    const hakbun = $('table tr:nth-of-type(2) td:nth-of-type(1)').text().trim();
    const name = $('table tr:nth-of-type(2) td:nth-of-type(2)').text().trim();
    const grade = $('table tr:nth-of-type(2) td:nth-of-type(3)').text().trim();
    const academicStatus = $('table tr:nth-of-type(4) td:nth-of-type(1)').text().trim();
    const undergraduate = $('table tr:nth-of-type(4) td:nth-of-type(2)').text().trim();
    const major = $('table tr:nth-of-type(4) td:nth-of-type(3)').text().trim();

    return { hakbun, name, grade, academicStatus, undergraduate, major };
}

export async function hakbunSearch_v2(birth: string, name: string): Promise<{ hakbun: string; major: string }> {
    const sqlParamInfo = `:Inp1.BIRTH%7B%08%7D:Inp1.EMP_NM%7B%0C%7D${birth}%7B%08%7D${encodeURIComponent(name)}`;
    const rawParam = `dbid=31&charset=&cid=&uid=&cmd=select&mod=0&param=&pos=0&form=AM0103M&dir=AM&sqlIndex=List1_1&sqlParamInfo=${sqlParamInfo}`;
    const encodedParam = Buffer.from(rawParam, "utf-8").toString("base64");

    const requestBody = qs.stringify({
        myweb: encodedParam,
        _my_TargetObject: "List1",
        _my_CmdMode: "0",
    });

    const response = await axios.post(
        "https://was1.hallym.ac.kr:8087/hlwc/frame/crossurl.jsp",
        requestBody,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                Origin: "https://was1.hallym.ac.kr:8087",
                Referer: "https://was1.hallym.ac.kr:8087/hlwc/AM/AM0103M.html",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest",
                "X-Prototype-Version": "1.7.2",
            },
            responseType: "arraybuffer",
        }
    );

    // euc-kr 디코딩
    const decodedStr = iconv.decode(response.data, "euc-kr");

    // Buffer를 다시 만들어서 바이너리 값으로 직접 분리
    const buf = Buffer.from(decodedStr, "utf-8");

    // 구분자 0x08(백스페이스), 0x0C(폼피드)로 split
    const splitParts = [];
    let start = 0;
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] === 0x08) {
            splitParts.push(buf.subarray(start, i).toString("utf-8"));
            start = i + 1;
        }
    }
    // 마지막 남은 부분
    splitParts.push(buf.subarray(start).toString("utf-8"));

    // 4) 폼피드(0x0C) 제거
    const cleanedParts = splitParts.map((p) => p.replace(/\f/g, "").trim());

    const major = cleanedParts[3] || "";
    const hakbun = cleanedParts[4] || "";

    return { hakbun, major };
}