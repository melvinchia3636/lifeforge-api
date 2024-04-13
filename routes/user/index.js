import express from 'express';
import passkey from './routes/passkey.js';

const router = express.Router();

router.use('/passkey', passkey);

router.patch('/module', async (req, res) => {
    try {
        const { pb } = req;
        const { id, data } = req.body;
        await pb.collection('users').update(id, {
            enabledModules: data,
        });

        res.json({
            state: 'success',
            message: 'User updated',
        });
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: error.message,
        });
    }
});

router.patch('/personalization', async (req, res) => {
    try {
        const { pb } = req;
        const { id, data } = req.body;
        await pb.collection('users').update(id, data);

        res.json({
            state: 'success',
            message: 'User updated successfully',
        });
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: error.message,
        });
    }
});

export default router;
