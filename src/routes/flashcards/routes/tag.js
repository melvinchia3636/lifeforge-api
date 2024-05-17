import express from 'express';
import { success } from '../../../utils/response';
import asyncWrapper from '../../../utils/asyncWrapper';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entries = await pb.collection('flashcards_tag').getFullList();

    success(res, entries);
}));

export default router;
