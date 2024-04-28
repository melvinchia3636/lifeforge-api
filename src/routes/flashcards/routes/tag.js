import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entries = await pb.collection('flashcards_tag').getFullList();

    success(res, entries);
}));

export default router;
