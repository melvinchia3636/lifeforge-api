import express from 'express';
import workspaceRoutes from './routes/workspace';
import subjectRoutes from './routes/subject';
import entryRoutes from './routes/entry';

const router = express.Router();

router.use('/workspace', workspaceRoutes);
router.use('/subject', subjectRoutes);
router.use('/entry', entryRoutes);

export default router;
