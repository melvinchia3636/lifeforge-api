import serverless from 'serverless-http';
import express from 'express';
import router from '../src/app.js';

const app = express();
app.set('view engine', 'ejs');

app.use('/', router);

export const handler = serverless(app);
