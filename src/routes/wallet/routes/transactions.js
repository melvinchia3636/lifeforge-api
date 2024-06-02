/* eslint-disable no-underscore-dangle */
import express from 'express';
import asyncWrapper from '../../../utils/asyncWrapper.js';
import { clientError, success } from '../../../utils/response.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const transactions = await pb.collection('wallet_transaction').getFullList({
        sort: '-date,-created',
    });

    success(res, transactions);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const {
        particulars,
        date,
        amount,
        category,
        asset,
        ledger,
        type,
        side,
        fromAsset,
        toAsset,
     } = req.body;

    if (type === 'transfer') {
        if (!fromAsset || !toAsset) {
            clientError(res, 'Missing required fields');
            return;
        }
    } else if (!particulars || !date || !amount || !type || !side) {
            clientError(res, 'Missing required fields');
            return;
        }

    if (type === 'income' || type === 'expenses') {
        await pb.collection('wallet_transaction').create({
            particulars,
            date,
            amount,
            category,
            asset,
            ledger,
            type,
            side,
        });

        if (asset) {
            const _asset = await pb.collection('wallet_assets').getOne(asset);

            if (side === 'credit') {
                await pb.collection('wallet_assets').update(asset, {
                    balance: _asset.balance - amount,
                });
            } else {
                await pb.collection('wallet_assets').update(asset, {
                    balance: _asset.balance + amount,
                });
            }
        }
    }

    if (type === 'transfer') {
        const _from = await pb.collection('wallet_assets').getOne(fromAsset);
        const _to = await pb.collection('wallet_assets').getOne(toAsset);

        if (!_from || !_to) {
            clientError(res, 'Invalid asset');
            return;
        }

        await pb.collection('wallet_transaction').create({
            type: 'transfer',
            particulars: `Transfer from ${_from.name}`,
            date,
            amount,
            side: 'debit',
            asset: toAsset,
        });

        await pb.collection('wallet_transaction').create({
            type: 'transfer',
            particulars: `Transfer to ${_to.name}`,
            date,
            amount,
            side: 'credit',
            asset: fromAsset,
        });

        await pb.collection('wallet_assets').update(fromAsset, {
            balance: _from.balance - amount,
        });

        await pb.collection('wallet_assets').update(toAsset, {
            balance: _to.balance + amount,
        });
    }

    success(res);
}));

router.patch('/update/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const {
        particulars,
        date,
        amount,
        category,
        asset,
        ledger,
        type,
        side,
     } = req.body;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const transaction = await pb.collection('wallet_transaction').getOne(id);

    if (amount !== transaction.amount) {
        if (transaction.asset) {
            const _asset = await pb.collection('wallet_assets').getOne(transaction.asset);

            if (transaction.side === 'debit') {
                await pb.collection('wallet_assets').update(transaction.asset, {
                    balance: _asset.balance - transaction.amount + amount,
                });
            } else {
                await pb.collection('wallet_assets').update(transaction.asset, {
                    balance: _asset.balance + transaction.amount - amount,
                });
            }
        }
    }

    await pb.collection('wallet_transaction').update(id, {
        particulars,
        date,
        amount,
        category,
        asset,
        ledger,
        type,
        side,
    });

    success(res);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const transaction = await pb.collection('wallet_transaction').getOne(id);

    if (transaction.asset) {
        const asset = await pb.collection('wallet_assets').getOne(transaction.asset);

        if (transaction.side === 'debit') {
            await pb.collection('wallet_assets').update(transaction.asset, {
                balance: asset.balance - transaction.amount,
            });
        } else {
            await pb.collection('wallet_assets').update(transaction.asset, {
                balance: asset.balance + transaction.amount,
            });
        }
    }

    await pb.collection('wallet_transaction').delete(id);

    success(res, transaction);
}));

export default router;
