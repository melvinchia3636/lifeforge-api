import express from 'express';
import asyncWrapper from '../../../utils/asyncWrapper.js';
import { clientError, success } from '../../../utils/response.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const transactions = await pb.collection('wallet_transaction').getFullList();

    success(res, transactions);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const {
        type,
        particulars,
        amount,
        date,
        category,
        asset,
        ledger,
     } = req.body;

    if (!type || !particulars || !amount || !date || !category || !asset || !ledger) {
        clientError(res, 'Missing required fields');
        return;
    }

    const transaction = await pb.collection('wallet_transaction').create({
        type,
        particulars,
        amount,
        date,
        category,
        asset,
        ledger,
    });

    success(res, transaction);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const transaction = await pb.collection('wallet_transaction').delete(id);

    success(res, transaction);
}));

export default router;
