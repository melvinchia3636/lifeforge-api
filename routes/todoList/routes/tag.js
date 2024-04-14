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

export default router;
