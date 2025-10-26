// src/index.ts
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { initChatSocket } from './sockets/chatSocket';
import { getLocalIP } from './custom_modules/utils';

import userRouter from './routes/user';
import noticeRouter from './routes/notice';
import chatRouter from './routes/chat';
import categoryRouter from './routes/category';
import tableUpdateRouter from './routes/tableUpdate'
import matchController from './routes/match'
import verifyTokenRouter from './routes/verifyToken';
import sportRouter from "./routes/sport";
import teamRouter from "./routes/team";
import standingRoutes from "./routes/standing";
import roomRouter from './routes/room';
import reportRouter from './routes/report';
import statisticsRouter from './routes/statistics';

import { requestLogger } from './middlewares/loggingMiddleware';
import { sanitizeBody } from "./middlewares/sanitizeBodyMiddleware";

const app = express();
const server = http.createServer(app);
const port = 3001;

app.use(cors({
    origin: 'https://intramural-test-v1.kro.kr', // 프론트엔드 주소
    credentials: true, // 쿠키 허용
}));

const io = new Server(server, {
    cors: {
        origin: 'https://intramural-test-v1.kro.kr',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

initChatSocket(io);

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(requestLogger);
app.use(sanitizeBody);

app.use('/api/table-update', tableUpdateRouter);
app.use("/api/standing", standingRoutes);

app.use('/api/user', userRouter);
app.use('/api/notice', noticeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/room', roomRouter);
app.use('/api/category', categoryRouter);
app.use('/api/match', matchController);
app.use("/api/sport", sportRouter);
app.use("/api/team", teamRouter);
app.use('/api/report', reportRouter);
app.use('/api/statistics', statisticsRouter);

server.listen(port, () => {
    const localIP = getLocalIP();
    console.log('');
    console.log('\x1b[1;30m%s\x1b[0m', '\t\b⬢ Express.js');
    console.log('\x1b[37m%s\x1b[0m', `\t\b- Local:  \t\bhttp://localhost:${port}`);
    console.log('\x1b[37m%s\x1b[0m', `\t\b- Network:\t\bhttp://${localIP}:${port}`);
    console.log('');
});