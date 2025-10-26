import { Request, Response, NextFunction } from "express";
import xss from "xss";

export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === "object") {
        // 깊이 순회하며 문자열만 XSS 필터링
        const stack: Array<{ parent: any; key: string | number; value: any }> = [];
        stack.push({ parent: { reqBody: req.body }, key: "reqBody", value: req.body });

        while (stack.length > 0) {
            const { parent, key, value } = stack.pop()!;

            if (typeof value === "string") {
                parent[key] = xss(value);
            } else if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    stack.push({ parent: value, key: i, value: value[i] });
                }
            } else if (value && typeof value === "object") {
                for (const k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        stack.push({ parent: value, key: k, value: value[k] });
                    }
                }
            } else {
                parent[key] = value; // number, boolean, null 등은 그대로
            }
        }

        req.body = req.body; // 필터링된 객체로 덮어쓰기
    }

    next();
}