/* eslint-disable no-param-reassign */
import express from 'express';
import master from './routes/master';
import password from './routes/password';

const router = express.Router();

router.use('/master', master);
router.use('/password', password);

export default router;
