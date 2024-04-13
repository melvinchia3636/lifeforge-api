import express from 'express';
import container from './routes/container.js';
import idea from './routes/idea.js';

const router = express.Router();

router.use('/container', container);
router.use('/idea', idea);

export default router;
