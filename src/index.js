import serverless from 'serverless-http';
<<<<<<< HEAD
import express from 'express';
import router from './app.js';

const app = express();

app.use('/', router);
=======
import app from './app';
>>>>>>> c60ef73fc23f2a88bc095b2e84ffc85beda11f2d

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
