import express from 'express';
import asyncWrapper from '../../../utils/asyncWrapper.js';
import { clientError, success } from '../../../utils/response.js';

const router = express.Router();

router.get('/get/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    const folder = await pb.collection('idea_box_folder').getOne(id);
    success(res, folder);
}));

router.get('/list/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'conatiner id is required');
        return;
    }

    const folders = await pb.collection('idea_box_folder').getFullList({
        filter: `container = "${id}"`,
        sort: 'name',
    });
    success(res, folders);
}));

router.post('/create', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const {
 name, container, icon, color,
} = req.body;

    if (!name || !container || !icon || !color) {
        clientError(res, 'Missing required fields');
        return;
    }

    const folder = await pb.collection('idea_box_folder').create({
        name,
        container,
        icon,
        color,
    });

    success(res, folder);
}));

router.patch('/update/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const {
        name, icon, color,
    } = req.body;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    if (!name && !icon && !color) {
        clientError(res, 'Missing required fields');
        return;
    }

    await pb.collection('idea_box_folder').update(id, {
        name,
        icon,
        color,
    });

    success(res);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!id) {
        clientError(res, 'id is required');
        return;
    }

    await pb.collection('idea_box_folder').delete(id);
    success(res);
}));

router.post('/add-idea/:folderId', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { folderId } = req.params;
    const { ideaId } = req.body;

    if (!folderId) {
        clientError(res, 'folderId is required');
        return;
    }

    if (!ideaId) {
        clientError(res, 'Idea id is required');
        return;
    }

    await pb.collection('idea_box_entry').update(ideaId, {
        folder: folderId,
    });

    success(res);
}));

router.delete('/remove-idea/:folderId', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { folderId } = req.params;
    const { ideaId } = req.body;

    if (!folderId) {
        clientError(res, 'folderId is required');
        return;
    }

    if (!ideaId) {
        clientError(res, 'Idea id is required');
        return;
    }

    await pb.collection('idea_box_entry').update(ideaId, {
        folder: '',
    });

    success(res);
}));

export default router;
