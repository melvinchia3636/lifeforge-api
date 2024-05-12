import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const tags = await pb.collection('todo_tag').getFullList();

    success(res, tags);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { name } = req.body;
    const tag = await pb.collection('todo_tag').create({
        name,
    });

    success(res, tag);
}));

router.patch('/update/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const { name } = req.body;

    const tag = await pb.collection('todo_tag').update(id, {
        name,
    });

    success(res, tag);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            state: 'error',
            message: 'ID is required',
        });
        return;
    }

    await pb.collection('todo_tag').delete(id);
    success(res);
}));

export default router;
