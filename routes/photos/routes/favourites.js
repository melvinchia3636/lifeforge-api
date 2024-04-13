/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import express from 'express';

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
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

        res.json({
            state: 'success',
            data: photos,
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

router.patch('/add-photos', async (req, res) => {
    try {
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

        res.json({
            state: 'success',
            message: 'Added to favourites',
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

export default router;
