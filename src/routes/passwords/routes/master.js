import express from 'express';
import bcrypt from 'bcrypt';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.post('/create', asyncWrapper(async (req, res) => {
    const { id, password } = req.body;
    const { pb } = req;

    const salt = await bcrypt.genSalt(10);
    const masterPasswordHash = await bcrypt.hash(password, salt);

    await pb.collection('users').update(id, {
        masterPasswordHash,
    });

    res.json({
        state: 'success',
        hash: masterPasswordHash,
    });
}));

router.post('/verify', asyncWrapper(async (req, res) => {
    const { id, password } = req.body;
    const { pb } = req;

    const user = await pb.collection('users').getOne(id);
    const { masterPasswordHash } = user;

    const isMatch = await bcrypt.compare(password, masterPasswordHash);

    success(res, isMatch);
}));

export default router;
