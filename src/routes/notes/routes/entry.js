/* eslint-disable no-continue */
/* eslint-disable no-empty */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import express from 'express';
import fs from 'fs';
import uploadMiddleware from '../../../middleware/uploadMiddleware.js';
import { clientError, success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/get/:id', asyncWrapper(async (req, res) => {
    if (!req.params.id) {
        clientError(res, 'id is required');
    }

    const { pb } = req;
    const note = await pb.collection('notes_entry').getOne(req.params.id);

    success(res, note);
}));

router.get('/list/:subject/*', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const notes = await pb.collection('notes_entry').getFullList({
        filter: `subject = "${req.params.subject}" && parent = "${req.params[0].split('/').pop()}"`,
    });

    success(res, notes);
}));

router.get('/valid/:workspace/:subject/*', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { totalItems: totalWorkspaceItems } = await pb.collection('notes_workspace').getList(1, 1, {
        filter: `id = "${req.params.workspace}"`,
    });
    const { totalItems: totalSubjectItems } = await pb.collection('notes_subject').getList(1, 1, {
        filter: `id = "${req.params.subject}"`,
    });

    if (!totalWorkspaceItems || !totalSubjectItems) {
        success(res, false);
        return;
    }

    const paths = req.params[0].split('/').filter((p) => p !== '');

    for (const path of paths) {
        const { totalItems: totalEntryItems } = await pb.collection('notes_entry').getList(1, 1, {
            filter: `id = "${path}"`,
        });

        if (!totalEntryItems) {
            success(res, false);
            return;
        }
    }

    success(res, true);
}));

router.get('/path/:workspace/:subject/*', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const workspace = await pb.collection('notes_workspace').getOne(req.params.workspace);
    const subject = await pb.collection('notes_subject').getOne(req.params.subject);
    const paths = req.params[0].split('/').filter((p) => p !== '');

    const result = [{
        id: workspace.id,
        name: workspace.name,
    }, {
        id: subject.id,
        name: subject.title,
    }];

    for (const path of paths) {
        const note = await pb.collection('notes_entry').getOne(path);
        result.push({
            id: path,
            name: note.name,
        });
    }

    success(res, {
        icon: subject.icon,
        path: result,
    });
}));

router.post('/create/folder', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const { name } = req.body;
    const existing = await pb.collection('notes_entry').getFullList({
        filter: `name = "${name}" && parent = "${req.body.parent}" && subject = "${req.body.subject}"`,
    });

    if (existing.length > 0) {
        res.status(400).json({
            state: 'error',
            message: 'Duplicate name',
        });
        return;
    }

    const note = await pb.collection('notes_entry').create(req.body);

    success(res, note);
}));

router.post('/upload/:workspace/:subject/*', uploadMiddleware, asyncWrapper(async (req, res) => {
    const { pb } = req;

    if (req.files.length === 0) {
        return res.status(400).send({
            state: 'error',
            message: 'No files were uploaded.',
        });
    }

    for (const file of req.files) {
        let parent = req.params[0].split('/').pop();

        if (file.originalname.endsWith('.DS_Store')) {
            try {
                fs.unlinkSync(file.path);
            } catch (error) { }
            continue;
        }

        file.originalname = decodeURIComponent(file.originalname);

        const path = file.originalname.split('/');
        const name = path.pop();

        for (let i = 0; i < path.length; i += 1) {
            const existing = await pb.collection('notes_entry').getFullList({
                filter: `name = "${path[i]}" && parent = "${parent}" && subject = "${req.params.subject}"`,
            });

            if (existing.length > 0) {
                parent = existing[0].id;
            } else {
                const note = await pb.collection('notes_entry').create({
                    name: path[i],
                    type: 'folder',
                    parent,
                    subject: req.params.subject,
                }, { $autoCancel: false });

                parent = note.id;
            }
        }

        const existing = await pb.collection('notes_entry').getFullList({
            filter: `name = "${name}" && parent = "${parent}" && subject = "${req.params.subject}"`,
        });

        if (existing.length > 0) {
            continue;
        }

        if (fs.existsSync(file.path)) {
            const fileBuffer = fs.readFileSync(file.path);

            await pb.collection('notes_entry').create({
                name,
                type: 'file',
                parent,
                subject: req.params.subject,
                file: new File([fileBuffer], name, { type: file.mimetype }),
            }, { $autoCancel: false });

            try {
                fs.unlinkSync(file.path);
            } catch (error) {
            }
        }
    }

    success(res, null);
}));

router.patch('/update/folder/:id', asyncWrapper(async (req, res) => {
    if (!req.params.id) {
        clientError(res, 'id is required');

        return;
    }

    const { pb } = req;
    const note = await pb.collection('notes_entry').update(req.params.id, req.body);

    success(res, note);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    if (!req.params.id) {
        clientError(res, 'id is required');

        return;
    }

    const { pb } = req;
    await pb.collection('notes_entry').delete(req.params.id);

    success(res, null);
}));

export default router;
