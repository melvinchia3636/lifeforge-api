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
    '/photos/entry/list',
    '/photos/entry/name',
    '/photos/entry/download',
    '/media',
    '/books/list',
    '/books-library/cover',
    '/cron',
    '/locales/en',
    '/locales/zh-CN',
    '/locales/zh-TW',
    '/locales/ms',
    '/style.css'
]

const pocketbaseMiddleware = async (req, res, next) => {
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

    try {
        pb.authStore.save(bearerToken, null)

        try {
            await pb.collection('users').authRefresh()
        } catch (error) {
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
