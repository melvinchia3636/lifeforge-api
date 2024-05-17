import express from 'express';
import entry from './routes/entry';
import list from './routes/list';
import tag from './routes/tag';

const router = express.Router();

router.use('/entry', entry);
router.use('/list', list);
router.use('/tag', tag);

export default router;
