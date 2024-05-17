import express from 'express';
import { success } from '../../../utils/response';
import asyncWrapper from '../../../utils/asyncWrapper';

const router = express.Router();

router.get('/get/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const entry = await pb.collection('flashcards_deck').getOne(id);

    success(res, entry);
}));

router.get('/valid/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const { totalItems } = await pb.collection('flashcards_deck').getList(1, 1, {
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
    const entries = await pb.collection('flashcards_deck').getFullList({
        expand: 'tag',
    });

    success(res, entries);
}));

export default router;
