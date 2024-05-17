import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const languages = await pb.collection('code_snippets_language').getFullList();

    success(res, languages);
}));

export default router;
