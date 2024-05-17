/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable camelcase */
import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import all_routes from 'express-list-endpoints';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import morganMiddleware from './middleware/morganMiddleware.js';
import userRoutes from './routes/user/index.js';
import projectsKRoutes from './routes/projects-k/index.js';
import todoListRoutes from './routes/todoList/index.js';
import calendarRoutes from './routes/calendar/index.js';
import ideaBoxRoutes from './routes/ideaBox/index.js';
import codeTimeRoutes from './routes/codeTime/index.js';
import notesRoutes from './routes/notes/index.js';
import flashcardsRoutes from './routes/flashcards/index.js';
import spotifyRoutes from './routes/spotify/index.js';
import photosRoutes from './routes/photos/index.js';
import repositoriesRoutes from './routes/repositories/index.js';
import passwordsRoutes from './routes/passwords/index.js';
import journalRoutes from './routes/journal/index.js';
import serverRoutes from './routes/server/index.js';
import changeLogRoutes from './routes/changeLog/index.js';
import pocketbaseMiddleware from './middleware/pocketbaseMiddleware.js';

import DESCRIPTIONS from './constants/description.js';

import asyncWrapper from './utils/asyncWrapper.js';

// const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: '.env.local' });

const app = express();
app.set('view engine', 'ejs');
const router = express.Router();

router.use(cors());
router.use(express.raw());
router.use(express.json());
router.use(morganMiddleware);
router.use(pocketbaseMiddleware);

router.get('/', async (req, res) => {
    const routes = all_routes(router).flatMap((route) => route.methods.map((method) => ({
        path: route.path,
        method,
        description: DESCRIPTIONS[route.path],
    }))).reduce((acc, route) => {
        if (acc[route.path.split('/')[1]]) {
            acc[route.path.split('/')[1]].push(route);
        } else {
            acc[route.path.split('/')[1]] = [route];
        }
        return acc;
    }, {});

    res.render('api-explorer', {
        routes,
    });
});
router.get('/media/:collectionId/:entryId/:photoId', asyncWrapper(async (req, res) => {
    const { collectionId, entryId, photoId } = req.params;
    const fetchResponse = await fetch(`${process.env.PB_HOST}/api/files/${collectionId}/${entryId}/${photoId}${req.query.thumb ? `?thumb=${req.query.thumb}` : ''}`);

    if (!fetchResponse.ok) {
        res.status(fetchResponse.status).send({
            state: 'error',
            message: fetchResponse.statusText,
        });
        return;
    }

    Readable.fromWeb(fetchResponse.body).pipe(res);
}));

router.use('/user', userRoutes);
router.use('/projects-k', projectsKRoutes);
router.use('/todo-list', todoListRoutes);
router.use('/calendar', calendarRoutes);
router.use('/idea-box', ideaBoxRoutes);
router.use('/code-time', codeTimeRoutes);
router.use('/notes', notesRoutes);
router.use('/flashcards', flashcardsRoutes);
router.use('/spotify', spotifyRoutes);
router.use('/photos', photosRoutes);
router.use('/repositories', repositoriesRoutes);
router.use('/passwords', passwordsRoutes);
router.use('/journal', journalRoutes);
router.use('/server', serverRoutes);
router.use('/change-log', changeLogRoutes);

router.use((req, res) => {
    res.status(404);

    res.json({
        state: 'error',
        message: 'Not Found',
    });
});

router.use((err, req, res, next) => {
    res.status(500);

    res.json({
        state: 'error',
        message: err.message,
    });
});

// router.get("/books/list", (req, res) => {
//     const { stdout, stderr } = exec("/routerlications/calibre.router/Contents/MacOS/calibredb list --for-machine", (err, stdout, stderr) => {
//         if (err) {
//             return
//         }
//         res.json(JSON.parse(stdout))
//     })
// })

app.use('/', router);

export default router;
