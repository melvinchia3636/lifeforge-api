import express from 'express';

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const tags = await pb.collection('todo_tag').getFullList();
        res.json({
            state: 'success',
            data: tags,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { pb } = req;
        const { name } = req.body;
        const tag = await pb.collection('todo_tag').create({
            name,
        });
        res.json({
            state: 'success',
            data: tag,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

export default router;
