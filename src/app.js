/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable camelcase */
import express from 'express';
import cors from 'cors';
import path from 'path';
import all_routes from 'express-list-endpoints';
import dotenv from 'dotenv';
import { Readable } from 'stream';
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

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import asyncWrapper from './utils/asyncWrapper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: '.env.local' });

const app = express();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.raw());
app.use(express.json());
app.use(morganMiddleware);
app.use(pocketbaseMiddleware);

app.get('/', async (req, res) => {
    const routes = all_routes(app).flatMap((route) => route.methods.map((method) => ({
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
app.get("/media/:collectionId/:entryId/:photoId", asyncWrapper(async (req, res) => {
    const { collectionId, entryId, photoId } = req.params
    console.log(`${process.env.PB_HOST}/api/files/${collectionId}/${entryId}/${photoId}${req.query.thumb?`?thumb=${req.query.thumb}`:''}`)
    const fetchResponse = await fetch(`${process.env.PB_HOST}/api/files/${collectionId}/${entryId}/${photoId}${req.query.thumb?`?thumb=${req.query.thumb}`:''}`)

    if (!fetchResponse.ok) {
        res.status(fetchResponse.status).send({
            state: 'error',
            message: fetchResponse.statusText,
        });
    }

    Readable.fromWeb( fetchResponse.body ).pipe( res );
}))

app.use('/user', userRoutes);
app.use('/projects-k', projectsKRoutes);
app.use('/todo-list', todoListRoutes);
app.use('/calendar', calendarRoutes);
app.use('/idea-box', ideaBoxRoutes);
app.use('/code-time', codeTimeRoutes);
app.use('/notes', notesRoutes);
app.use('/flashcards', flashcardsRoutes);
app.use('/spotify', spotifyRoutes);
app.use('/photos', photosRoutes);
app.use('/repositories', repositoriesRoutes);
app.use('/passwords', passwordsRoutes);
app.use('/journal', journalRoutes);
app.use('/server', serverRoutes);
app.use('/change-log', changeLogRoutes);

app.use((req, res) => {
    res.status(404);

    res.json({
        state: 'error',
        message: 'Not Found',
    });
});

app.use((err, req, res, next) => {
    res.status(500);

    res.json({
        state: 'error',
        message: err.message,
    });
});

// app.get("/books/list", (req, res) => {
//     const { stdout, stderr } = exec("/Applications/calibre.app/Contents/MacOS/calibredb list --for-machine", (err, stdout, stderr) => {
//         if (err) {
//             return
//         }
//         res.json(JSON.parse(stdout))
//     })
// })

export default app