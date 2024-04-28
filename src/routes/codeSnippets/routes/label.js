import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const labels = await pb.collection('code_snippets_label').getFullList();

    success(res, labels);
}));

router.put('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { name, color } = req.body;
    const label = await pb.collection('code_snippets_label').create({
        name,
        color,
    });

    success(res, label);
}));

export default router;