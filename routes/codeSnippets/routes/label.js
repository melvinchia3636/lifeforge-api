import express from 'express';

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const labels = await pb.collection('code_snippets_label').getFullList();
        res.json({
            state: 'success',
            data: labels,
        });
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

router.put('/create', async (req, res) => {
    try {
        const { pb } = req;
        const { name, color } = req.body;
        const label = await pb.collection('code_snippets_label').create({
            name,
            color,
        });
        res.json({
            state: 'success',
            data: label,
        });
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

export default router;
