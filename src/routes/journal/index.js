import express from 'express';
import entry from './routes/entry';

const router = express.Router();

router.use('/entry', entry);

export default router;
