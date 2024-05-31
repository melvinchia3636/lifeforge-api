import express from 'express';
import assetsRoutes from './routes/assets.js';
import ledgersRoutes from './routes/ledgers.js';

const router = express.Router();

router.use('/assets', assetsRoutes);
router.use('/ledgers', ledgersRoutes);

export default router;
