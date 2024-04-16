import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entries = await pb.collection('todo_entry').getFullList();

    const sortedEntries = {
        done: [],
        pending: [],
    };

    entries.forEach((entry) => {
        if (entry.done) {
            sortedEntries.done.push(entry);
        } else {
            sortedEntries.pending.push(entry);
        }
    });

    success(res, sortedEntries);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entry = await pb.collection('todo_entry').create(req.body);
    if (entry.list) {
        await pb.collection('todo_list').update(entry.list, {
            'amount+': 1,
        });
    }
    success(res, entry);
}));

router.patch('/update/:id', asyncWrapper(async (req, res) => {
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

    success(res, entry);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entry = await pb.collection('todo_entry').getOne(req.params.id);

    await pb.collection('todo_entry').delete(req.params.id);
    if (entry.list) {
        await pb.collection('todo_list').update(entry.list, {
            'amount-': 1,
        });
    }

    success(res);
}));

router.patch('/toggle/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entry = await pb.collection('todo_entry').getOne(req.params.id);
    await pb.collection('todo_entry').update(req.params.id, {
        done: !entry.done,
    });
    success(res);
}));

export default router;
