import express from 'express';
import tagRoutes from './routes/tag';
import deckRoutes from './routes/deck';
import cardRoutes from './routes/card';

const router = express.Router();

router.use('/tag', tagRoutes);
router.use('/deck', deckRoutes);
router.use('/card', cardRoutes);

export default router;
