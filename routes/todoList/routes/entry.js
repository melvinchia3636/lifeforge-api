const express = require('express');

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const entries = await pb.collection('todo_entry').getFullList();
        res.json({
            state: 'success',
            data: entries,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.post('/toggle/:id', async (req, res) => {
    try {
        const { pb } = req;
        const entry = await pb.collection('todo_entry').getOne(req.params.id);
        await pb.collection('todo_entry').update(req.params.id, {
            done: !entry.done,
        });
        res.json({
            state: 'success',
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

module.exports = router;
