import express from 'express';
import { clientError, success } from '../../../utils/response';
import asyncWrapper from '../../../utils/asyncWrapper';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const labels = await pb.collection('code_snippets_label').getFullList();

    success(res, labels);
}));

router.put('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { name, color } = req.body;

    if (!name || !color) {
        clientError(res, 'Missing required fields');
        return;
    }

    const label = await pb.collection('code_snippets_label').create({
        name,
        color,
    });

    success(res, label);
}));

export default router;
