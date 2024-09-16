import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import request from 'request'
import all_routes from 'express-list-endpoints'
import { exec } from 'child_process'
import { rateLimit } from 'express-rate-limit'
import Pocketbase from 'pocketbase'

import localesRoutes from './routes/locales/index.js'
import userRoutes from './routes/user/index.js'
import projectsMRoutes from './routes/projectsM/index.js'
// import projectsKRoutes from './routes/projects-k/index.js'
import todoListRoutes from './routes/todoList/index.js'
import calendarRoutes from './routes/calendar/index.js'
import ideaBoxRoutes from './routes/ideaBox/index.js'
import codeTimeRoutes from './routes/codeTime/index.js'
import notesRoutes from './routes/notes/index.js'
import flashcardsRoutes from './routes/flashcards/index.js'
import achievementsRoutes from './routes/achievements/index.js'
import spotifyRoutes from './routes/spotify/index.js'
import photosRoutes from './routes/photos/index.js'
import musicRoutes from './routes/music/index.js'
import guitarTabsRoutes from './routes/guitarTabs/index.js'
import repositoriesRoutes from './routes/repositories/index.js'
import passwordsRoutes from './routes/passwords/index.js'
import airportsRoutes from './routes/airports/index.js'
import changiRoutes from './routes/changi/index.js'
import journalRoutes from './routes/journal/index.js'
import serverRoutes from './routes/server/index.js'
import changeLogRoutes from './routes/changeLog/index.js'
import DNSRecordsRoutes from './routes/dnsRecords/index.js'
import mailInboxRoutes from './routes/mailInbox/index.js'
import walletRoutes from './routes/wallet/index.js'
import youtubeVideosRoutes from './routes/youtubeVideos/index.js'

import morganMiddleware from './middleware/morganMiddleware.js'
import pocketbaseMiddleware from './middleware/pocketbaseMiddleware.js'

import DESCRIPTIONS from './constants/description.js'

import asyncWrapper from './utils/asyncWrapper.js'
import { query } from 'express-validator'
import hasError from './utils/checkError.js'

// const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()
app.disable('x-powered-by')
app.set('view engine', 'ejs')
const router = express.Router()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    skip: async req => {
        if (
            req.path.startsWith('/media/') ||
            req.path.match(/\/locales\/(\w|-){2,5}$/) ||
            [
                '/code-time/user/minutes',
                '/code-time/eventLog',
                '/user/passkey/challenge',
                '/user/passkey/login',
                '/user/auth/verify',
                '/user/auth/login',
                '/books-library/cover',
                '/status',
                '/youtube-videos/video/thumbnail'
            ].some(route => req.path.startsWith(route))
        ) {
            return true
        }

        const bearerToken = req.headers.authorization?.split(' ')[1]
        const pb = new Pocketbase(process.env.PB_HOST)

        if (!bearerToken) {
            return false
        }

        try {
            pb.authStore.save(bearerToken, null)

            try {
                await pb.collection('users').authRefresh()
                return true
            } catch (error: any) {
                if (error.response.code === 401) {
                    return false
                }
            }
        } catch {
            return false
        }
        return false
    }
})

router.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    })
)
router.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://improved-zebra-55ggwr697jvh47xr-5173.app.github.dev',
            'https://lifeforge.thecodeblog.net',
            'https://localization-manager.lifeforge.thecodeblog.net'
        ]
    })
)
router.use(express.raw())
router.use(express.json())
router.use(morganMiddleware)
router.use(pocketbaseMiddleware)
router.use(limiter)
router.use(express.static('static'))

router.get('/status', async (req: Request, res: Response) => {
    res.json({
        state: 'success'
    })
})

router.get(
    '/',
    asyncWrapper(async (_: Request, res: Response) => {
        const routes = Object.fromEntries(
            Object.entries(
                all_routes(router as any)
                    .flatMap(route =>
                        route.methods.map(method => ({
                            path: route.path,
                            method,
                            description:
                                DESCRIPTIONS[
                                    `${method} ${route.path.replace(/:(\w+)/g, '{$1}')}` as keyof typeof DESCRIPTIONS
                                ]
                        }))
                    )

                    .reduce(
                        (
                            acc: Record<
                                string,
                                {
                                    path: string
                                    method: string
                                    description: string
                                }[]
                            >,
                            route
                        ) => {
                            const r = route.path.split(
                                '/'
                            )[1] as keyof typeof acc
                            if (acc[r]) {
                                acc[r].push(route)
                            } else {
                                acc[r] = [route]
                            }
                            return acc
                        },
                        {}
                    )
            ).map(([key, value]) => [
                key,
                value.sort((a, b) => {
                    if (a.path.split('/')[2] === b.path.split('/')[2]) {
                        return (
                            ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].indexOf(
                                a.method
                            ) -
                            ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].indexOf(
                                b.method
                            )
                        )
                    }
                    return a.path.localeCompare(b.path)
                })
            ])
        )

        res.render('api-explorer', {
            routes
        })
    })
)

router.get(
    '/media/:collectionId/:entriesId/:photoId',
    [
        query('thumb').optional().isString(),
        query('token').optional().isString()
    ],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { thumb, token } = req.query as {
            thumb?: string
            token?: string
        }

        const { collectionId, entriesId, photoId } = req.params
        const searchParams = new URLSearchParams()

        if (thumb) {
            searchParams.append('thumb', thumb)
        }

        if (token) {
            searchParams.append('token', token)
        }

        request(
            `${process.env.PB_HOST}/api/files/${collectionId}/${entriesId}/${photoId}?${searchParams.toString()}`
        ).pipe(res)
    })
)
router.use('/locales', localesRoutes)
router.use('/user', userRoutes)
router.use('/projects-m', projectsMRoutes)
// router.use('/projects-k', projectsKRoutes)
router.use('/todo-list', todoListRoutes)
router.use('/calendar', calendarRoutes)
router.use('/idea-box', ideaBoxRoutes)
router.use('/code-time', codeTimeRoutes)
router.use('/notes', notesRoutes)
router.use('/flashcards', flashcardsRoutes)
router.use('/journal', journalRoutes)
router.use('/achievements', achievementsRoutes)
router.use('/wallet', walletRoutes)
router.use('/spotify', spotifyRoutes)
router.use('/photos', photosRoutes)
router.use('/music', musicRoutes)
router.use('/guitar-tabs', guitarTabsRoutes)
router.use('/youtube-videos', youtubeVideosRoutes)
router.use('/repositories', repositoriesRoutes)
router.use('/passwords', passwordsRoutes)
router.use('/airports', airportsRoutes)
router.use('/changi', changiRoutes)
router.use('/mail-inbox', mailInboxRoutes)
router.use('/dns-records', DNSRecordsRoutes)
router.use('/server', serverRoutes)
router.use('/change-log', changeLogRoutes)

router.get(
    '/books-library/list',
    asyncWrapper(async (_: Request, res: Response) => {
        exec(
            'xvfb-run calibredb list --with-library ../calibre --for-machine -f cover,authors,title'
        ).stdout?.once('data', data => {
            const parsedData = JSON.parse(data)
            parsedData.forEach((item: any) => {
                item.cover = item.cover
                    .replace(process.env.CALIBRE_PATH, '')
                    .replace(/^\//, '')
                    .replace(/cover.jpg$/, '')
            })

            res.json({
                state: 'success',
                data: parsedData
            })
        })
    })
)

router.get(
    '/books-library/cover/:author/:book',
    asyncWrapper(async (req: Request, res: Response) => {
        const { author, book } = req.params
        console.log(
            `/home/pi/${
                process.env.DATABASE_OWNER
            }/calibre/${author}/${book}/cover.jpg`
        )
        res.sendFile(
            `/home/pi/${
                process.env.DATABASE_OWNER
            }/calibre/${author}/${book}/cover.jpg`
        )
    })
)

router.get('/cron', async (req: Request, res: Response) => {
    res.json({
        state: 'success'
    })
})

router.use((req: Request, res: Response) => {
    res.status(404)

    res.json({
        state: 'error',
        message: 'Not Found'
    })
})

app.use('/', router)

export default router
