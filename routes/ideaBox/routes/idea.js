/* eslint-disable indent */
import express from 'express';
import multer from 'multer';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list/:containerId', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { containerId } = req.params;
    const { archived } = req.query;

    if (!containerId) {
        res.status(400)
            .json({
                state: 'error',
                message: 'containerId is required',
            });
        return;
    }

    const ideas = await pb.collection('idea_box_entry').getFullList({
        filter: `container = "${containerId}" && archived = ${archived || 'false'}`,
        sort: '-pinned,-created',
    });
    success(res, ideas);
}));

router.post('/create/:containerId', multer().single('image'), asyncWrapper(async (req, res) => {
    const { pb } = req;
    const {
        title, content, link, type,
    } = req.body;

    const { file } = req;
    const { containerId } = req.params;

    if (!containerId) {
        res.status(400)
            .json({
                state: 'error',
                message: 'containerId is required',
            });
        return;
    }

    let data;
    switch (type) {
        case 'text':
            data = {
                content,
                type,
                container: containerId,
            };
            break;
        case 'link':
            data = {
                title,
                content: link,
                type,
                container: containerId,
            };
            break;
        case 'image':
            data = {
                title,
                type,
                image: new File([file.buffer], file.originalname, { type: file.mimetype }),
                container: containerId,
            };
            break;
        default:
            res.status(400)
                .json({
                    state: 'error',
                    message: 'Invalid type',
                });
            return;
    }

    const idea = await pb.collection('idea_box_entry').create(data);
    await pb.collection('idea_box_container').update(containerId, {
        [`${type}_count+`]: 1,
    });

    success(res, idea);
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

    const idea = await pb.collection('idea_box_entry').getOne(id);
    await pb.collection('idea_box_entry').delete(id);
    await pb.collection('idea_box_container').update(idea.container, {
        [`${idea.type}_count-`]: 1,
    });

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

    const {
        title, content, link, type,
    } = req.body;

    let data;
    switch (type) {
        case 'text':
            data = {
                content,
                type,
            };
            break;
        case 'link':
            data = {
                title,
                content: link,
                type,
            };
            break;
        default:
            res.status(400)
                .json({
                    state: 'error',
                    message: 'Invalid type',
                });
            return;
    }

    await pb.collection('idea_box_entry').update(id, data);

    success(res);
}));

router.patch('/pin/:id', asyncWrapper(async (req, res) => {
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

    const idea = await pb.collection('idea_box_entry').getOne(id);
    await pb.collection('idea_box_entry').update(id, {
        pinned: !idea.pinned,
    });

    success(res);
}));

router.patch('/archive/:id', asyncWrapper(async (req, res) => {
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

    const idea = await pb.collection('idea_box_entry').getOne(id);
    await pb.collection('idea_box_entry').update(id, {
        archived: !idea.archived,
        pinned: false,
    });

    success(res);
}));

export default router;
