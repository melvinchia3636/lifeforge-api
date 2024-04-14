/* eslint-disable no-param-reassign */
import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/get/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        res.status(400)
            .json({
                state: 'error',
                message: 'id is required',
            });
        return;
    }

    const container = await pb.collection('code_snippets_entry').getOne(id);
    success(res, container);
}));

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const containers = (await pb.collection('code_snippets_entry').getFullList()).map((container) => {
        delete container.code;
        return container;
    });

    success(res, containers);
}));

router.put('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { name, color, icon } = req.body;
    const container = await pb.collection('code_snippets_entry').create({
        name,
        color,
        icon,
    });

    success(res, container);
}));

export default router;
