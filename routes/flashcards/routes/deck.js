const express = require('express');

const router = express.Router();

router.get('/get/:id', async (req, res) => {
    try {
        const { pb } = req;
        const { id } = req.params;
        const entry = await pb.collection('flashcards_deck').getOne(id);

        res.json({
            state: 'success',
            data: entry,
        });
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

router.get('/valid/:id', async (req, res) => {
    try {
        const { pb } = req;
        const { id } = req.params;

        if (!id) {
            res.status(400)
                .json({
                    state: 'error',
                    message: 'id is required',
                });
            return;
        }

        const { totalItems } = await pb.collection('flashcards_deck').getList(1, 1, {
            filter: `id = "${id}"`,
        });

        if (totalItems === 1) {
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
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const entries = await pb.collection('flashcards_deck').getFullList({
            expand: 'tag',
        });

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

module.exports = router;
