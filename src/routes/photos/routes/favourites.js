/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import express from 'express';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;

    let photos = await pb.collection('photos_entry_dimensions').getFullList({
        filter: 'is_favourite = true',
        expand: 'photo',
        fields: 'expand.photo.id,expand.photo.image,expand.photo.raw,width,height,id,expand.photo.collectionId',
        sort: '-shot_time',
    });

    photos = photos.map((photo) => ({
        width: photo.width,
        height: photo.height,
        ...photo.expand.photo,
        photoId: photo.expand.photo.id,
        id: photo.id,
    }));

    success(res, photos);
}));

router.patch('/add-photos', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { photos } = req.body;

    const { isInAlbum } = req.query;

    for (const id of photos) {
        let dim;

        if (isInAlbum === 'true') {
            dim = await pb.collection('photos_entry_dimensions').getOne(id);
        } else {
            dim = await pb.collection('photos_entry_dimensions').getFirstListItem(`photo = "${id}"`);
        }

        if (dim) {
            await pb.collection('photos_entry_dimensions').update(dim.id, {
                is_favourite: true,
            });
        } else {
            res.status(404).json({
                state: 'error',
                message: 'Photo not found',
            });
        }
    }

    success(res);
}));

export default router;