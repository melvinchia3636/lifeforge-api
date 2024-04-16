/* eslint-disable consistent-return */
import express from 'express';

import fs from 'fs';
import mime from 'mime-types';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.put('/replace/:projectId', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const newFiles = fs.readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`).filter((file) => !file.startsWith('.'));

    if (newFiles.length === 0) {
        return res.status(401).json({
            state: 'error',
            message: 'No files are detected in the uploads folder',
        });
    }

    await pb.collection('projects_k_entry').update(req.params.projectId, {
        files: null,
    });

    await pb.collection('projects_k_entry').update(req.params.projectId, {
        files: newFiles.map((file) => {
            const buffer = fs.readFileSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`);
            return new File([buffer], file, { type: mime.lookup(file) });
        }),
        last_file_replacement_time: new Date().toISOString(),
    });

    newFiles.forEach((file) => {
        fs.unlinkSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`);
    });

    return success(res, newFiles);
}));

router.get('/download/:projectId', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const project = await pb.collection('projects_k_entry').getOne(req.params.projectId);
    const { files, collectionId, id } = project;

    if (!files) {
        return res.status(401).json({
            state: 'error',
            message: 'No files are detected in the project',
        });
    }

    files.forEach((file) => {
        const location = `/media/${process.env.DATABASE_OWNER}/database/pb_data/storage/${collectionId}/${id}/${file}`;
        fs.copyFileSync(location, `/media/${process.env.DATABASE_OWNER}/uploads/${file.split('.')[0].split('_').slice(0, -1).join('_')}.${file.split('.').pop()}`);
    });

    success(res);
}));

router.delete('/clear-medium', asyncWrapper(async (req, res) => {
    const files = fs.readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`).filter((file) => !file.startsWith('.'));
    files.forEach((file) => {
        fs.unlinkSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`);
    });

    success(res);
}));

router.put('/set-thumbnail/:projectId', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { file } = req.body;

    const project = await pb.collection('projects_k_entry').getOne(req.params.projectId);

    const type = mime.lookup(file);

    if (!['image/png', 'image/jpeg'].includes(type)) {
        return res.status(401).json({
            state: 'error',
            message: 'File type is not supported',
        });
    }

    const buffer = fs.readFileSync(`/media/${process.env.DATABASE_OWNER}/database/pb_data/storage/${project.collectionId}/${project.id}/${file}`);
    await pb.collection('projects_k_entry').update(req.params.projectId, {
        thumbnail: new File([buffer], file, { type }),
        thumb_original_filename: file,
    });

    success(res);
}));

export default router;
