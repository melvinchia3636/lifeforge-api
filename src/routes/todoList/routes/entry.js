/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import express from 'express';
import moment from 'moment';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const status = req.query.status || 'all';
    if (!['all', 'today', 'scheduled', 'overdue', 'completed'].includes(status)) {
        res.status(400).send({
            state: 'error',
            message: 'Invalid status',
        });
        return;
    }

    const filters = {
        all: 'done = false',
        today: `done = false && due_date >= "${
            moment().startOf('day').utc().format('YYYY-MM-DD HH:mm:ss')
        }" && due_date <= "${
            moment().endOf('day').utc().format('YYYY-MM-DD HH:mm:ss')
        }"`,
        scheduled: `done = false && due_date != "" && due_date >= "${
            moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }"`,
        overdue: `done = false && due_date != "" && due_date < "${
            moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }"`,
        completed: 'done = true',
    };

    let finalFilter = filters[status];

    const { tag, list } = req.query;
    if (tag) finalFilter += ` && tags ~ "${tag}"`;
    if (list) finalFilter += ` && list = "${list}"`;

    const entries = await pb.collection('todo_entry').getFullList({
        filter: finalFilter,
    });

    success(res, entries);
}));

router.get('/status-counter', asyncWrapper(async (req, res) => {
    const filters = {
        all: 'done = false',
        today: `done = false && due_date >= "${
            moment().startOf('day').utc().format('YYYY-MM-DD HH:mm:ss')
        }" && due_date <= "${
            moment().endOf('day').utc().format('YYYY-MM-DD HH:mm:ss')
        }"`,
        scheduled: `done = false && due_date != "" && due_date >= "${
            moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }"`,
        overdue: `done = false && due_date != "" && due_date < "${
            moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }"`,
        completed: 'done = true',
    };

    const { pb } = req;

    const counters = {};

    for (const type of Object.keys(filters)) {
        const { totalItems } = await pb.collection('todo_entry').getList(1, 1, {
            filter: filters[type],
        });

        counters[type] = totalItems;
    }

    success(res, counters);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entry = await pb.collection('todo_entry').create(req.body);
    if (entry.list) {
        await pb.collection('todo_list').update(entry.list, {
            'amount+': 1,
        });
    }
    success(res, entry);
}));

router.patch('/update/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const originalEntry = await pb.collection('todo_entry').getOne(req.params.id);
    const entry = await pb.collection('todo_entry').update(req.params.id, req.body);
    if (originalEntry.list !== entry.list) {
        if (originalEntry.list) {
            await pb.collection('todo_list').update(originalEntry.list, {
                'amount-': 1,
            });
        }
        if (entry.list) {
            await pb.collection('todo_list').update(entry.list, {
                'amount+': 1,
            });
        }
    }

    for (const tag of originalEntry.tags) {
        if (!entry.tags.includes(tag)) {
            await pb.collection('todo_tag').update(tag, {
                'amount-': 1,
            });
        }
    }

    for (const tag of entry.tags) {
        if (!originalEntry.tags.includes(tag)) {
            await pb.collection('todo_tag').update(tag, {
                'amount+': 1,
            });
        }
    }

    success(res, entry);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entry = await pb.collection('todo_entry').getOne(req.params.id);

    await pb.collection('todo_entry').delete(req.params.id);
    if (entry.list) {
        await pb.collection('todo_list').update(entry.list, {
            'amount-': 1,
        });
    }

    for (const tag of entry.tags) {
        await pb.collection('todo_tag').update(tag, {
            'amount-': 1,
        });
    }

    success(res);
}));

router.patch('/toggle/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entry = await pb.collection('todo_entry').getOne(req.params.id);
    await pb.collection('todo_entry').update(req.params.id, {
        done: !entry.done,
        completed_at: entry.done ? null : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
    });
    success(res);
}));

export default router;
