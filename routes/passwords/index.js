/* eslint-disable no-param-reassign */
import express from 'express';
import master from './routes/master.js';
import password from './routes/password.js';

const router = express.Router();

router.use('/master', master);
router.use('/password', password);

export default router;
