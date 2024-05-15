import express from 'express';
import labelRoutes from './routes/label';
import languageRoutes from './routes/language';
import entryRoutes from './routes/entry';

const router = express.Router();

router.use('/label', labelRoutes);
router.use('/language', languageRoutes);
router.use('/entry', entryRoutes);

export default router;
