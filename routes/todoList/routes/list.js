import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const categories = await pb.collection('todo_list').getFullList();
    success(res, categories);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const category = await pb.collection('todo_list').create(req.body);
    success(res, category);
}));

export default router;
