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

    const container = await pb.collection('idea_box_container').getOne(id);
    success(res, container);
}));

router.get('/valid/:id', asyncWrapper(async (req, res) => {
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

    const { totalItems } = await pb.collection('idea_box_container').getList(1, 1, {
        filter: `id = "${id}"`,
    });

    if (totalItems === 1) {
        success(res, true);
    } else {
        success(res, false);
    }
}));

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const containers = await pb.collection('idea_box_container').getFullList();
    success(res, containers);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { name, color, icon } = req.body;
    const container = await pb.collection('idea_box_container').create({
        name,
        color,
        icon,
    });
    success(res, container);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
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

    await pb.collection('idea_box_container').delete(id);

    success(res);
}));

router.patch('/update/:id', asyncWrapper(async (req, res) => {
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

    const { name, color, icon } = req.body;
    await pb.collection('idea_box_container').update(id, {
        name,
        color,
        icon,
    });

    success(res);
}));

export default router;
