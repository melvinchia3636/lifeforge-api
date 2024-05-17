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
import morganMiddleware from './middleware/morganMiddleware';
import userRoutes from './routes/user/index';
import projectsKRoutes from './routes/projects-k/index';
import todoListRoutes from './routes/todoList/index';
import calendarRoutes from './routes/calendar/index';
import ideaBoxRoutes from './routes/ideaBox/index';
import codeTimeRoutes from './routes/codeTime/index';
import notesRoutes from './routes/notes/index';
import flashcardsRoutes from './routes/flashcards/index';
import spotifyRoutes from './routes/spotify/index';
import photosRoutes from './routes/photos/index';
import repositoriesRoutes from './routes/repositories/index';
import passwordsRoutes from './routes/passwords/index';
import journalRoutes from './routes/journal/index';
import serverRoutes from './routes/server/index';
import changeLogRoutes from './routes/changeLog/index';
import pocketbaseMiddleware from './middleware/pocketbaseMiddleware';

import DESCRIPTIONS from './constants/description';

import asyncWrapper from './utils/asyncWrapper';

// const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: '.env.local' });

const router = express.Router();
router.set('views', path.join(__dirname, '/views'));
router.set('view engine', 'ejs');

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
    console.log(`${process.env.PB_HOST}/api/files/${collectionId}/${entryId}/${photoId}${req.query.thumb ? `?thumb=${req.query.thumb}` : ''}`);
    const fetchResponse = await fetch(`${process.env.PB_HOST}/api/files/${collectionId}/${entryId}/${photoId}${req.query.thumb ? `?thumb=${req.query.thumb}` : ''}`);

    if (!fetchResponse.ok) {
        res.status(fetchResponse.status).send({
            state: 'error',
            message: fetchResponse.statusText,
        });
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

export default router;
