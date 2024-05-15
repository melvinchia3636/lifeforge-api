import express from 'express';
import { success, clientError } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const events = await pb.collection('calendar_event').getFullList();

    success(res, events);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { title, start, end } = req.body;

    if (!title || !start || !end) {
        clientError(res, 'Missing required fields');
        return;
    }

    const events = await pb.collection('calendar_event').create({
        title,
        start,
        end,
    });

    success(res, events);
}));

router.patch('/update', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const {
        id, title, start, end,
    } = req.body;

    if (!id) {
        clientError(res, 'Missing required fields');
        return;
    }

    const events = await pb.collection('calendar_event').update(id, {
        title,
        start,
        end,
    });

    success(res, events);
}));

export default router;
