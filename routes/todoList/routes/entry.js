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

router.post('/create', async (req, res) => {
    try {
        const { pb } = req;
        const entry = await pb.collection('todo_entry').create(req.body);
        if (entry.list) {
            await pb.collection('todo_list').update(entry.list, {
                'amount+': 1,
            });
        }
        res.json({
            state: 'success',
            data: entry,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.patch('/update/:id', async (req, res) => {
    try {
        const { pb } = req;
        const originalEntry = await pb.collection('todo_entry').getOne(req.params.id);
        const entry = await pb.collection('todo_entry').update(req.params.id, req.body);
        if (originalEntry.list !== entry.list) {
            await pb.collection('todo_list').update(originalEntry.list, {
                'amount-': 1,
            });
            await pb.collection('todo_list').update(entry.list, {
                'amount+': 1,
            });
        }

        res.json({
            state: 'success',
            data: entry,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { pb } = req;
        const entry = await pb.collection('todo_entry').getOne(req.params.id);

        await pb.collection('todo_entry').delete(req.params.id);
        if (entry.list) {
            await pb.collection('todo_list').update(entry.list, {
                'amount-': 1,
            });
        }

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

router.patch('/toggle/:id', async (req, res) => {
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
