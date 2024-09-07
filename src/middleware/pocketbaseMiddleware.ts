import { NextFunction, Request, Response } from 'express'
import Pocketbase from 'pocketbase'

const NO_NEED_AUTH = [
    '/user/passkey',
    '/user/auth/login',
    '/spotify',
    '/code-time/user/minutes',
    '/code-time/eventLog',
    '/photos/album/check-publicity',
    '/photos/album/valid',
    '/photos/album/get',
    '/photos/entries/list',
    '/photos/entries/name',
    '/photos/entries/download',
    '/media',
    '/books/list',
    '/books-library/cover',
    '/cron',
    '/locales/en',
    '/locales/zh-CN',
    '/locales/zh-TW',
    '/locales/ms',
    '/style.css',
    '/youtube-video-storage/video/thumbnail',
    '/youtube-video-storage/video/stream'
]

const pocketbaseMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bearerToken = req.headers.authorization?.split(' ')[1]
    const pb = new Pocketbase(process.env.PB_HOST)

    if (!bearerToken) {
        if (
            req.url === '/' ||
            NO_NEED_AUTH.some(route => req.url.startsWith(route))
        ) {
            req.pb = pb
            next()
            return
        }
    }

    if (!bearerToken) {
        res.status(401).send({
            state: 'error',
            message: 'Authorization token is required'
        })
        return
    }

    try {
        pb.authStore.save(bearerToken, null)

        try {
            await pb.collection('users').authRefresh()
        } catch (error: any) {
            if (error.response.code === 401) {
                res.status(401).send({
                    state: 'error',
                    message: 'Invalid authorization credentials'
                })
                return
            }
        }

        req.pb = pb
        next()
    } catch {
        res.status(500).send({
            state: 'error',
            message: 'Internal server error'
        })
    }
}

export default pocketbaseMiddleware
