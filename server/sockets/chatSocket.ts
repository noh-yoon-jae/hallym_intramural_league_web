import { Server } from 'socket.io'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

let ioInstance: Server | null = null

export function getIO(): Server {
    if (!ioInstance) throw new Error('Socket.io not initialized')
    return ioInstance
}

const anonymousIpCount = new Map<string, number>()
const anonymousSocketToIp = new Map<string, string>()
const memberSockets = new Set<string>()

export function getChatUserCounts() {
    return {
        anonymous: anonymousIpCount.size,
        member: memberSockets.size,
    }
}

function emitUserCounts(io: Server) {
    io.emit('userCount', getChatUserCounts());
}

const { JWT_SECRET } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'env.json'), 'utf-8')
)

export function initChatSocket(io: Server) {
    ioInstance = io
    io.on('connection', (socket) => {
        console.log('socket connected')

        const cookieHeader = socket.handshake.headers.cookie
        if (cookieHeader) {
            try {
                const cookies = parse(cookieHeader)
                const token = cookies['jwt']
                if (token) {
                    const decoded: any = jwt.verify(token, JWT_SECRET)
                    socket.data.userId = decoded.id
                    memberSockets.add(socket.id)
                }
            } catch (e) {
                // ignore invalid token
            }
        }

        if (!socket.data.userId) {
            const ipHeader = (socket.handshake.headers['x-forwarded-for'] as string) || socket.handshake.address
            const ip = (ipHeader || '').split(',')[0].trim()
            const current = anonymousIpCount.get(ip) || 0
            anonymousIpCount.set(ip, current + 1)
            anonymousSocketToIp.set(socket.id, ip)
        }

        emitUserCounts(io);

        let currentRoomId: number | null = null;

        socket.on('joinRoom', (roomId: number) => {
            if (currentRoomId !== null) {
                socket.leave(currentRoomId.toString())
            }
            currentRoomId = roomId
            socket.join(currentRoomId.toString())
            console.log(`Joined room ${currentRoomId}`)
        })

        socket.on('leaveRoom', () => {
            if (currentRoomId !== null) {
                socket.leave(currentRoomId.toString())
                console.log(`Left room ${currentRoomId}`)
                currentRoomId = null
            }
        })

        socket.on('chat', (msg) => {
            if (!socket.data.userId) {
                socket.emit('error', { message: '로그인이 필요합니다.' })
                return
            }

            if (currentRoomId) {
                io.to(currentRoomId.toString()).emit('chat', msg)
            }
        })

        socket.on('disconnect', () => {
            console.log('socket disconnected')
            memberSockets.delete(socket.id)
            const ip = anonymousSocketToIp.get(socket.id)
            if (ip) {
                const count = anonymousIpCount.get(ip) || 0
                if (count <= 1) {
                    anonymousIpCount.delete(ip)
                } else {
                    anonymousIpCount.set(ip, count - 1)
                }
                anonymousSocketToIp.delete(socket.id)
            }
            if (currentRoomId !== null) {
                socket.leave(currentRoomId.toString())
                currentRoomId = null
            }
            emitUserCounts(io);
        })
    })
}