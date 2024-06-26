import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import request from 'request'
import all_routes from 'express-list-endpoints'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { rateLimit } from 'express-rate-limit'
import Pocketbase from 'pocketbase'

import localesRoutes from './routes/locales/index.js'
import userRoutes from './routes/user/index.js'
import projectsMRoutes from './routes/projects-m/index.js'
import projectsKRoutes from './routes/projects-k/index.js'
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
import guitarTabsRoutes from './routes/guitar-tabs/index.js'
import repositoriesRoutes from './routes/repositories/index.js'
import passwordsRoutes from './routes/passwords/index.js'
import airportsRoutes from './routes/airports/index.js'
import changiRoutes from './routes/changi/index.js'
import journalRoutes from './routes/journal/index.js'
import serverRoutes from './routes/server/index.js'
import changeLogRoutes from './routes/changeLog/index.js'
import DNSRecordsRoutes from './routes/dns-records/index.js'
import mailInboxRoutes from './routes/mail-inbox/index.js'
import walletRoutes from './routes/wallet/index.js'

import morganMiddleware from './middleware/morganMiddleware.js'
import pocketbaseMiddleware from './middleware/pocketbaseMiddleware.js'

import DESCRIPTIONS from './constants/description.js'

import asyncWrapper from './utils/asyncWrapper.js'

// const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: '.env.local' })

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
                '/codetime/minutes',
                '/codetime/eventLog',
                '/user/passkey/challenge',
                '/user/passkey/login',
                '/user/auth/verify',
                '/user/auth/login',
                '/books-library/cover'
            ].some(route => req.path.startsWith(route))
        ) {
            return true
        }

        const bearerToken = req.headers.authorization?.split(' ')[1]
        const pb = new Pocketbase(process.env.PB_HOST)

        try {
            pb.authStore.save(bearerToken, null)

            try {
                await pb.collection('users').authRefresh()
                return true
            } catch (error) {
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

router.get('/', async (req, res) => {
    const routes = Object.fromEntries(
        Object.entries(
            all_routes(router)
                .flatMap(route =>
                    route.methods.map(method => ({
                        path: route.path,
                        method,
                        description:
                            DESCRIPTIONS[
                                `${method} ${route.path.replace(/:(\w+)/g, '{$1}')}`
                            ]
                    }))
                )

                .reduce((acc, route) => {
                    if (acc[route.path.split('/')[1]]) {
                        acc[route.path.split('/')[1]].push(route)
                    } else {
                        acc[route.path.split('/')[1]] = [route]
                    }
                    return acc
                }, {})
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

router.get(
    '/media/:collectionId/:entryId/:photoId',
    asyncWrapper(async (req, res) => {
        const { collectionId, entryId, photoId } = req.params
        request(
            `${process.env.PB_HOST}/api/files/${collectionId}/${entryId}/${photoId}${req.query.thumb ? `?thumb=${req.query.thumb}` : ''}`
        ).pipe(res)
    })
)
router.use('/locales', localesRoutes)
router.use('/user', userRoutes)
router.use('/projects-m', projectsMRoutes)
router.use('/projects-k', projectsKRoutes)
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
    asyncWrapper(async (req, res) => {
        exec(
            'calibredb list --with-library ../calibre --for-machine -f cover,authors,title'
        ).stdout.once('data', data => {
            const parsedData = JSON.parse(data)
            parsedData.forEach(item => {
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
    asyncWrapper(async (req, res) => {
        const { author, book } = req.params
        res.sendFile(`/media/melvin/calibre/${author}/${book}/cover.jpg`)
    })
)

router.get('/cron', async (req, res) => {
    res.json({
        state: 'success'
    })
})

router.use((req, res) => {
    res.status(404)

    res.json({
        state: 'error',
        message: 'Not Found'
    })
})

router.use((err, req, res) => {
    res.status(500)

    res.json({
        state: 'error',
        message: err.message
    })
})

app.use('/', router)

export default router
