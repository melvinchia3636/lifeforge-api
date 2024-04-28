/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable camelcase */
import express from 'express';
import cors from 'cors';
import all_routes from 'express-list-endpoints';
import dotenv from 'dotenv';
import morganMiddleware from './middleware/morganMiddleware.js';
import userRoutes from './routes/user/index.js';
import projectsKRoutes from './routes/projects-k/index.js';
import todoListRoutes from './routes/todoList/index.js';
import ideaBoxRoutes from './routes/ideaBox/index.js';
import codeTimeRoutes from './routes/codeTime/index.js';
import notesRoutes from './routes/notes/index.js';
import flashcardsRoutes from './routes/flashcards/index.js';
import spotifyRoutes from './routes/spotify/index.js';
import photosRoutes from './routes/photos/index.js';
import repositoriesRoutes from './routes/repositories/index.js';
import passwordsRoutes from './routes/passwords/index.js';
import serverRoutes from './routes/server/index.js';
import changeLogRoutes from './routes/changeLog/index.js';
import pocketbaseMiddleware from './middleware/pocketbaseMiddleware.js';

import DESCRIPTIONS from './constants/description.js';

dotenv.config({ path: '.env.local' });

const app = express();
app.set('view engine', 'ejs');

app.use(cors());
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
app.use('/user', userRoutes);
app.use('/projects-k', projectsKRoutes);
app.use('/todo-list', todoListRoutes);
app.use('/idea-box', ideaBoxRoutes);
app.use('/code-time', codeTimeRoutes);
app.use('/notes', notesRoutes);
app.use('/flashcards', flashcardsRoutes);
app.use('/spotify', spotifyRoutes);
app.use('/photos', photosRoutes);
app.use('/repositories', repositoriesRoutes);
app.use('/passwords', passwordsRoutes);
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

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
