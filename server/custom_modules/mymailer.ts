import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs'

import dotenv from 'dotenv';
dotenv.config();

const { email, email_password, base_url } = process.env;
if(!email || !email_password || !base_url) {
    throw new Error("Email configuration is not defined in .env");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: email,
        pass: email_password,
    },
    from: email,
});

function generateHtml(templatePath: string, data: any) {
    let template = fs.readFileSync(templatePath, 'utf8');
    template = template.replace('{{url}}', base_url!);
    Object.keys(data).forEach((key: string) => {
        template = template.replace('{{{' + key + '}}}', data[key]);
    });
    return template;
}

const mymailer = Object.freeze({
    send(recipient: string, type: string, data: any, callback: any) {
        const emailRegex = new RegExp(
            "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])",
        );
        if (!emailRegex.test(recipient)) {
            callback({
                status: false,
                reason: "유효하지 않은 이메일 주소입니다.",
            });
            return;
        }
        let templatePath = path.join(__dirname, "monopoly", "mail_form");
        let attachments: any[] = [];
        switch (type) {
            case "passwordReset":
                templatePath += "/reset_password/rp.html";
                // attachments = [{
                //     filename: 'image-1.png',
                //     path: path.join(__dirname, "..", "..", "monopoly", "mail_form", "reset_password", "images", "image-1.png"),
                //     cid: 'image1'
                // },
                // {
                //     filename: 'image-2.jpg',
                //     path: path.join(__dirname, "..", "..", "monopoly", "mail_form", "reset_password", "images", "image-2.jpeg"),
                //     cid: 'image2'
                // }]
                break;
            case "authenticationCode":
                templatePath += "/authentication_code/ac.html";
                break;
            default:
                break;
        }

        const mailOptions = {
            from: email,
            to: recipient,
            subject: "인증 메일입니다",
            html: generateHtml(templatePath, data),
            attachments: attachments,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                callback({
                    status: false,
                    reason: "메일 전송 실패",
                });
                return;
            } else {
                callback({
                    status: true,
                });
                return;
            }
        });
    },
});


export default mymailer;