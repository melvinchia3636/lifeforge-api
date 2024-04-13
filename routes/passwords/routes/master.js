import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const { id, password } = req.body;
        const { pb } = req;

        const salt = await bcrypt.genSalt(10);
        const masterPasswordHash = await bcrypt.hash(password, salt);

        await pb.collection('users').update(id, {
            masterPasswordHash,
        });

        res.json({
            state: 'success',
            hash: masterPasswordHash,
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { id, password } = req.body;
        const { pb } = req;

        const user = await pb.collection('users').getOne(id);
        const { masterPasswordHash } = user;

        const isMatch = await bcrypt.compare(password, masterPasswordHash);

        if (isMatch) {
            res.json({
                state: 'success',
                data: true,
            });
        } else {
            res.json({
                state: 'success',
                data: false,
            });
        }
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

export default router;
