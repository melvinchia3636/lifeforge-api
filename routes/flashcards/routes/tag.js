import express from 'express';

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const entries = await pb.collection('flashcards_tag').getFullList();

        res.json({
            state: 'success',
            data: entries,
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
