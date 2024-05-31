import express from 'express';
import asyncWrapper from '../../../utils/asyncWrapper.js';
import { clientError, success } from '../../../utils/response.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const assets = await pb.collection('wallet_assets').getFullList();

    success(res, assets);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { name, icon, balance } = req.body;

    if (!name || !icon || !balance) {
        clientError(res, 'Missing required fields');
        return;
    }

    const asset = await pb.collection('wallet_assets').create({
        name,
        icon,
        balance,
    });

    success(res, asset);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const asset = await pb.collection('wallet_assets').delete(id);

    success(res, asset);
}));

export default router;
