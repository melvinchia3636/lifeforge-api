import express from 'express';
import asyncWrapper from '../../../utils/asyncWrapper.js';
import { clientError, success } from '../../../utils/response.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const category = await pb.collection('wallet_category').getFullList();

    success(res, category);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { name, icon, color } = req.body;

    if (!name || !icon || !color) {
        clientError(res, 'Missing required fields');
        return;
    }

    const category = await pb.collection('wallet_category').create({
        name,
        icon,
        color,
    });

    success(res, category);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const category = await pb.collection('wallet_category').delete(id);

    success(res, category);
}));

export default router;
