/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable camelcase */
import express from 'express';
import cors from 'cors';
import Pocketbase from 'pocketbase';
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
import passwordsRoutes from './routes/passwords/index.js';
import serverRoutes from './routes/server/index.js';
import changeLogRoutes from './routes/changeLog/index.js';

dotenv.config({ path: '.env.local' });

const NO_NEED_AUTH = [
    '/user/passkey',
    '/spotify',
    '/code-time',
];

const initPB = async (req, res, next) => {
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const pb = new Pocketbase(process.env.PB_HOST);

    if (req.url === '/' || NO_NEED_AUTH.some((route) => req.url.startsWith(route))) {
        req.pb = pb;
        next();
        return;
    }

    try {
        pb.authStore.save(bearerToken, null);

        try {
            await pb.collection('users').authRefresh();
        } catch (error) {
            if (error.response.code === 401) {
                res.status(401).send({
                    state: 'error',
                    message: 'Invalid authorization credentials',
                });
                return;
            }
        }

        req.pb = pb;
        next();
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: 'Internal server error',
        });
    }
};

const app = express();
app.set('view engine', 'ejs');

app.use(morganMiddleware);
app.use(cors());
app.use(express.json());
app.use(initPB);

app.get('/', (req, res) => {
    const routes = all_routes(app).flatMap((route) => route.methods.map((method) => ({
        path: route.path,
        method,
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

// app.get("/books/list", (req, res) => {
//     const { stdout, stderr } = exec("/Applications/calibre.app/Contents/MacOS/calibredb list --for-machine", (err, stdout, stderr) => {
//         if (err) {
//             return
//         }
//         res.json(JSON.parse(stdout))
//     })
// })
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
