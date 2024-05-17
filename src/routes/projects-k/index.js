import express from 'express';
import entry from './routes/entry';
import progress from './routes/progress';
import files from './routes/files';
import { success } from '../../utils/response';
import asyncWrapper from '../../utils/asyncWrapper';

const router = express.Router();

router.use('/entry', entry);
router.use('/progress', progress);
router.use('/files', files);

router.get('/ip', asyncWrapper(async (req, res) => {
    import('node-public-ip').then(async ({ publicIp }) => {
        const ip = await publicIp();
        success(res, ip)
    });
}));

export default router;
