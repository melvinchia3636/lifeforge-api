/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable indent */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
/* eslint-disable no-continue */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import express from 'express';

import fs from 'fs';
import mime from 'mime-types';
import ExifReader from 'exifreader';
import moment from 'moment';
import axios from 'axios';
import { clientError, success } from '../../../utils/response';
import asyncWrapper from '../../../utils/asyncWrapper';

const router = express.Router();


const RAW_FILE_TYPE = [
    'ARW',
    'CR2',
    'CR3',
    'CRW',
    'DCR',
    'DNG',
    'ERF',
    'K25',
    'KDC',
    'MRW',
    'NEF',
    'ORF',
    'PEF',
    'RAF',
    'RAW',
    'SR2',
    'SRF',
    'X3F',
];

let progress = 0;
let allPhotosDimensions = undefined;

router.get('/name/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const { isInAlbum } = req.query;

    if (!id) {
        clientError(res, 'Photo ID is required');
        return
    }

    if (!pb.authStore.isValid) {
        await pb.admins.authWithPassword(
            process.env.PB_EMAIL,
            process.env.PB_PASSWORD,
        );

        let image

        if (isInAlbum === 'true') {
            const dim = await pb.collection('photos_entry_dimensions').getOne(id);
            image = await pb.collection('photos_entry').getOne(dim.photo);
            const album = await pb.collection('photos_album').getOne(image.album);

            if (!album.is_public) {
                res.status(401).json({
                    state: 'error',
                    message: 'Invalid authorization credentials',
                });
                return;
            }
        } else {
            res.status(401).json({
                state: 'error',
                message: 'Invalid authorization credentials',
            });
            return;
        }
    }

    let image;

    if (isInAlbum === 'true') {
        const dim = await pb.collection('photos_entry_dimensions').getOne(id);
        image = await pb.collection('photos_entry').getOne(dim.photo);
    } else {
        image = await pb.collection('photos_entry').getOne(id);
    }

    success(res, image.name)
}));

router.get('/download/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const { raw, isInAlbum } = req.query;

    if (!id) {
        clientError(res, 'Photo ID is required');
        return
    }

    if (!pb.authStore.isValid) {
        await pb.admins.authWithPassword(
            process.env.PB_EMAIL,
            process.env.PB_PASSWORD,
        );

        let image

        if (isInAlbum === 'true') {
            const dim = await pb.collection('photos_entry_dimensions').getOne(id);
            image = await pb.collection('photos_entry').getOne(dim.photo);
            const album = await pb.collection('photos_album').getOne(image.album);

            if (!album.is_public) {
                res.status(401).json({
                    state: 'error',
                    message: 'Invalid authorization credentials',
                });
            }
        } else {
            res.status(401).json({
                state: 'error',
                message: 'Invalid authorization credentials',
            });
        }
    }
    
    let image;

    if (isInAlbum === 'true') {
        const dim = await pb.collection('photos_entry_dimensions').getOne(id);
        image = await pb.collection('photos_entry').getOne(dim.photo);
    } else {
        image = await pb.collection('photos_entry').getOne(id);
    }

    const url = pb.files.getUrl(image, image[
        raw === 'true' ? 'raw' : 'image'
    ]);

    success(res, {
        url,
        fileName: `${image.name}.${image[
            raw === 'true' ? 'raw' : 'image'
        ].split('.').pop()}`,
    })
}));

router.post('/bulk-download', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { photos } = req.body;

    const { isInAlbum } = req.query;

    for (const photo of photos) {
        console.log(photo)
        let image;
        if (isInAlbum === "true") {
            const dim = await pb.collection('photos_entry_dimensions').getOne(photo);
            image = await pb.collection('photos_entry').getOne(dim.photo);
        } else {
            image = await pb.collection('photos_entry').getOne(photo);
        }

        const filePath = `/media/${process.env.DATABASE_OWNER}/database/pb_data/storage/${image.collectionId}/${image.id}/${image.image}`;

        fs.cpSync(filePath, `/media/${process.env.DATABASE_OWNER}/uploads/${image.name}.${image.image.split('.').pop()}`);
    }

    success(res);
}));

router.get('/dimensions/async-get', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { hideInAlbum } = req.query;

    res.status(202).json({
        state: 'accepted',
    })

    if (allPhotosDimensions === undefined) {
        allPhotosDimensions = "pending"
        const filter = `is_deleted = false ${hideInAlbum === 'true' ? '&& is_in_album=false' : ''} `;
        const response = await pb.collection('photos_entry_dimensions').getList(1, 1, { filter });
        const { collectionId } = await pb.collection('photos_entry').getFirstListItem('name != ""');
        const { totalItems } = response;
        const photos = await pb.collection('photos_entry_dimensions').getFullList({
            fields: 'photo, width, height, shot_time',
            filter,
        });

        photos.forEach((photo) => {
            photo.id = photo.photo;
            photo.shot_time = moment(photo.shot_time).format('YYYY-MM-DD HH:mm:ss');
        });

        const groupByDate = Object.entries(photos.reduce((acc, photo) => {
            const date = photo.shot_time.split(' ')[0];
            if (acc[date]) {
                acc[date].push(photo);
            } else {
                acc[date] = [photo];
            }
            return acc;
        }, {}));

        groupByDate.sort((a, b) => moment(b[0]).diff(moment(a[0])));

        const firstDayOfYear = {};
        const firstDayOfMonth = {};

        for (const [key] of groupByDate) {
            const date = moment(key);
            const year = date.year();
            if (!firstDayOfYear[year]) {
                firstDayOfYear[year] = date.format('YYYY-MM-DD');
            } else if (date.isBefore(moment(firstDayOfYear[year]))) {
                firstDayOfYear[year] = date.format('YYYY-MM-DD');
            }
        }

        for (const [key] of groupByDate) {
            const date = moment(key);
            const year = date.year();
            const month = date.month();
            if (month === moment(firstDayOfYear[year]).month()) {
                continue;
            }
            if (!firstDayOfMonth[`${year} -${month} `]) {
                firstDayOfMonth[`${year} -${month + 1} `] = date.format('YYYY-MM-DD');
            } else if (date.isBefore(moment(firstDayOfMonth[`${year} -${month} `]))) {
                firstDayOfMonth[`${year} -${month + 1} `] = date.format('YYYY-MM-DD');
            }
        }

        allPhotosDimensions = {
            items: groupByDate,
            firstDayOfYear,
            firstDayOfMonth,
            totalItems,
            collectionId,
        }
    }
}));

router.get("/dimensions/async-res", asyncWrapper(async (req, res) => {
    if (allPhotosDimensions === "pending") {
        return res.status(202).json({
            state: 'pending',
        });
    } else if (allPhotosDimensions !== undefined) {
        success(res, allPhotosDimensions)
        allPhotosDimensions = undefined
    } else {
        res.status(404).json({
            state: 'error',
            message: 'No data available',
        });
    }
}))

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { date } = req.query;

    if (!pb.authStore.isValid) {
        return res.status(401).json({
            state: 'error',
            message: 'Invalid authorization credentials',
        });
    }

    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({
            state: 'error',
            message: 'Invalid date format',
        });
    }

    const { hideInAlbum } = req.query;
    const filter = `is_deleted = false && shot_time >= '${moment(date, 'YYYY - MM - DD').startOf('day').utc().format('YYYY - MM - DD HH: mm:ss')
        }' && shot_time <= '${moment(date, 'YYYY-MM-DD').endOf('day').utc().format('YYYY-MM-DD HH:mm:ss')
        } ' ${hideInAlbum === 'true' ? ' && album = ""' : ''}`;
    let photos = await pb.collection('photos_entry_dimensions').getFullList({
        filter,
        expand: 'photo',
        fields: 'expand.photo.raw,is_in_album,is_favourite,expand.photo.id,expand.photo.image',
    });

    photos = photos.map((photo) => ({ ...photo.expand.photo, is_in_album: photo.is_in_album, is_favourite: photo.is_favourite }));

    photos.forEach((photo) => {
        photo.has_raw = photo.raw !== '';
        delete photo.raw;
    });

    success(res, photos)
}));

router.get('/list/:albumId', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { albumId } = req.params;

    if (!albumId) {
        return res.status(400).json({
            state: 'error',
            message: 'Album ID is required',
        });
    }

    if (!pb.authStore.isValid) {
        await pb.admins.authWithPassword(
            process.env.PB_EMAIL,
            process.env.PB_PASSWORD,
        );

        const album = await pb.collection('photos_album').getOne(albumId);

        if (!album.is_public) {
            res.status(401).json({
                state: 'error',
                message: 'Invalid authorization credentials',
            }); 
            return
        }
    }

    let photos = await pb.collection('photos_entry_dimensions').getFullList({
        filter: `photo.album = "${albumId}"`,
        expand: 'photo',
        fields: 'expand.photo.id,expand.photo.image,expand,shot_time.photo.raw,width,height,id,expand.photo.collectionId',
        sort: '-shot_time',
    });

    photos = photos.map((photo) => ({
        width: photo.width,
        height: photo.height,
        ...photo.expand.photo,
        photoId: photo.expand.photo.id,
        id: photo.id,
        has_raw: photo.expand.photo.raw !== '',
        shot_time: photo.shot_time
    }));

    photos.forEach(photo => {
        delete photo.raw
    })

    success(res, photos)
}));

router.post('/import', asyncWrapper(async (req, res) => {
    const { pb } = req;
    fs.readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`).filter((file) => file.startsWith('.')).forEach((file) => fs.unlinkSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`));

    const newFiles = fs.readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`).filter((file) => !file.startsWith('.') && (
        (mime.lookup(file) ? mime.lookup(file).startsWith('image') : false)
        || RAW_FILE_TYPE.includes(file.split('.').pop().toUpperCase())
    ));

    if (newFiles.length === 0) {
        return res.status(401).json({
            state: 'error',
            message: 'No files are detected in the uploads folder',
        });
    }

    const distinctFiles = {};

    for (const file of newFiles) {
        const fileWithoutExtension = file.split('.').slice(0, -1).join('.');
        if (distinctFiles[fileWithoutExtension]) {
            distinctFiles[fileWithoutExtension].push(file);
        } else {
            distinctFiles[fileWithoutExtension] = [file];
        }
    }

    progress = 0;
    let completed = 0;

    res.status(202).json({
        state: 'accepted',
    });

    for (const [key, value] of Object.entries(distinctFiles)) {
        const data = {
            name: key,
        };

        const rawFiles = value.filter((file) => RAW_FILE_TYPE.includes(file.split('.').pop().toUpperCase()));
        const imageFiles = value.filter((file) => !RAW_FILE_TYPE.includes(file.split('.').pop().toUpperCase()) && (mime.lookup(file) ? mime.lookup(file).startsWith('image') : false));

        if (imageFiles === 0) {
            completed += 1;
            progress = completed / Object.keys(distinctFiles).length;
            continue;
        }

        if (imageFiles.length > 0) {
            const filePath = `/media/${process.env.DATABASE_OWNER}/uploads/${imageFiles[0]}`;
            data.image = new File([fs.readFileSync(filePath)], imageFiles[0]);

            let tags;
            try {
                tags = await ExifReader.load(filePath);
            } catch (e) {
                tags = {};
            }

            data.filesize = fs.statSync(filePath).size;
            if (tags.DateTimeOriginal) {
                data.shot_time = moment(tags.DateTimeOriginal.value, 'YYYY:MM:DD HH:mm:ss').toISOString();
            } else {
                const dateStr = imageFiles[0].toUpperCase().match(/IMG-(?<date>\d+)-WA.+/)?.groups?.date;
                if (dateStr) {
                    data.shot_time = moment(dateStr, 'YYYYMMDD').format('YYYY-MM-DD HH:mm:ss');
                } else {
                    data.shot_time = moment(fs.statSync(filePath).birthtime).toISOString();
                }
            }

            if (tags.Orientation) {
                if (tags.PixelXDimension && tags.PixelYDimension) {
                    data.width = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags.PixelYDimension.value : tags.PixelXDimension.value;
                    data.height = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags.PixelXDimension.value : tags.PixelYDimension.value;
                } else if (tags['Image Width'] && tags['Image Height']) {
                    data.width = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags['Image Height'].value : tags['Image Width'].value;
                    data.height = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags['Image Width'].value : tags['Image Height'].value;
                } else {
                    data.width = 0;
                    data.height = 0;
                }
            } else if (tags.PixelXDimension && tags.PixelYDimension) {
                data.width = tags.PixelXDimension.value;
                data.height = tags.PixelYDimension.value;
            } else if (tags['Image Width'] && tags['Image Height']) {
                data.width = tags['Image Width'].value;
                data.height = tags['Image Height'].value;
            } else {
                data.width = 0;
                data.height = 0;
            }
        } else {
            completed += 1;
            progress = completed / Object.keys(distinctFiles).length;
            continue;
        }

        if (rawFiles.length > 0) {
            data.raw = rawFiles.map((file) => {
                const buffer = fs.readFileSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`);
                return new File([buffer], file);
            })[0];
        }

        const newEntry = await pb.collection('photos_entry').create({
            image: data.image,
            ...(data.raw ? { raw: data.raw } : {}),
            name: data.name,
        }, { $autoCancel: false });

        await pb.collection('photos_entry_dimensions').create({
            photo: newEntry.id,
            width: data.width,
            height: data.height,
            shot_time: data.shot_time,
        });

        const thumbnailImageUrl = pb.files.getUrl(newEntry, newEntry.image, {
            thumb: '0x300',
        });

        try {
            await axios.get(thumbnailImageUrl);
        } catch {
            console.log("Thumbnail doesn't exist");
        }

        for (const file of [...rawFiles, ...imageFiles]) {
            fs.unlinkSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`);
        }

        completed += 1;
        progress = completed / Object.keys(distinctFiles).length;
    }
}));

router.get('/import/progress', asyncWrapper(async (req, res) => {
    success(res, progress)
}));

router.delete('/delete', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { photos } = req.body;
    const { isInAlbum } = req.query;

    for (const photo of photos) {
        let dim;
        if (isInAlbum === 'true') {
            dim = await pb.collection('photos_entry_dimensions').getOne(photo);
        } else {
            dim = await pb.collection('photos_entry_dimensions').getFirstListItem(`photo = "${photo}"`);
        }

        if (dim.is_in_album) {
            const { album } = await pb.collection('photos_entry').getOne(dim.photo);
            await pb.collection('photos_album').update(album, {
                'amount-': 1,
            });

            await pb.collection('photos_entry').update(dim.photo, {
                album: '',
            });
        }

        await pb.collection('photos_entry_dimensions').update(dim.id, {
            is_deleted: true,
            is_in_album: false,
        });
    }

    success(res)
}));

export default router;
