import express from 'express';
import bcrypt from 'bcrypt';
import { clientError, success } from '../../../utils/response';
import asyncWrapper from '../../../utils/asyncWrapper';

const router = express.Router();

router.post('/create', asyncWrapper(async (req, res) => {
    const { id, password } = req.body;
    const { pb } = req;

    if (!id) {
        clientError(res, 'id is required');
    }

    if (!password) {
        clientError(res, 'password is required');
    }

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
