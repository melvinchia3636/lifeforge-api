import express from 'express';
import event from './routes/event';
import category from './routes/category';

const router = express.Router();

router.use('/event', event);
router.use('/category', category);

export default router;
