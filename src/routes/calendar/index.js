import express from 'express';
import event from './routes/event.js';

const router = express.Router();

router.use('/event', event);

export default router;
