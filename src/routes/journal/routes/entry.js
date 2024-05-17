/* eslint-disable no-param-reassign */
import express from 'express';
import { clientError, success } from '../../../utils/response';
import asyncWrapper from '../../../utils/asyncWrapper';

const router = express.Router();

router.get('/get/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;

    const entry = await pb.collection('journal_entry').getOne(id);

    success(res, entry);
}));

router.get('/valid/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const { totalItems } = await pb.collection('journal_entry').getList(1, 1, {
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

    const entries = await pb.collection('journal_entry').getFullList({
        sort: '-created',
    });

    entries.forEach((entry) => {
        entry.content = entry.content.split(/\s/g).slice(0, 80).join(' ');
    });

    success(res, entries);
}));

router.patch('/update-title/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;
    const { title } = req.body;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    if (!title) {
        clientError(res, 'title is required');
        return;
    }

    await pb.collection('journal_entry').update(id, {
        title,
    });

    success(res, 'Title updated');
}));

router.put('/update-content/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { pb } = req;
    const { content } = req.body;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    if (!content) {
        clientError(res, 'content is required');
        return;
    }

    await pb.collection('journal_entry').update(id, {
        content,
    });

    success(res, 'Content updated');
}));

export default router;
