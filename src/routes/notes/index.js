import express from 'express';
import workspaceRoutes from './routes/workspace.js';
import subjectRoutes from './routes/subject.js';
import entryRoutes from './routes/entry.js';

const router = express.Router();

router.use('/workspace', workspaceRoutes);
router.use('/subject', subjectRoutes);
router.use('/entry', entryRoutes);

export default router;
