import express from 'express';
import entry from './routes/entry.js';
import progress from './routes/progress.js';
import files from './routes/files.js';

const router = express.Router();

router.use('/entry', entry);
router.use('/progress', progress);
router.use('/files', files);

router.get('/ip', async (req, res) => {
    import('node-public-ip').then(async ({ publicIp }) => {
        const ip = await publicIp();
        res.json({
            state: 'success',
            data: ip,
        });
    });
});

export default router;
