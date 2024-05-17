import express from 'express';
import container from './routes/container';
import idea from './routes/idea';

const router = express.Router();

router.use('/container', container);
router.use('/idea', idea);

export default router;
