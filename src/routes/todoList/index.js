import express from 'express';
import entry from './routes/entry.js';
import subtask from './routes/subtask.js';
import list from './routes/list.js';
import tag from './routes/tag.js';

const router = express.Router();

router.use('/entry', entry);
router.use('/subtask', subtask);
router.use('/list', list);
router.use('/tag', tag);

export default router;
