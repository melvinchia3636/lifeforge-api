import express from 'express';
import entry from './routes/entry.js';
import list from './routes/list.js';
import tag from './routes/tag.js';

const router = express.Router();

router.use('/entry', entry);
router.use('/list', list);
router.use('/tag', tag);

export default router;
