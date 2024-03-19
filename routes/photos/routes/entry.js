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
const express = require('express');
const fs = require('fs');
const mime = require('mime-types');
const ExifReader = require('exifreader');
const moment = require('moment');
const axios = require('axios');

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

router.get('/dimensions', async (req, res) => {
    try {
        const { pb } = req;
        const { hideInAlbum } = req.query;
        const filter = `is_deleted = false ${hideInAlbum === 'true' ? '&& is_in_album=false' : ''}`;
        const response = await pb.collection('photos_entry_dimensions').getList(1, 1, { filter });
        const { collectionId } = await pb.collection('photos_entry').getFirstListItem('name != ""');
        const { totalItems } = response;
        const photos = await pb.collection('photos_entry_dimensions').getFullList({
            fields: 'photo, width, height, shot_time',
            filter,
            sort: '-shot_time',
        });

        photos.forEach((photo) => {
            photo.id = photo.photo;
            photo.shot_time = moment(photo.shot_time).format('YYYY-MM-DD');
        });

        const groupByDate = Object.entries(photos.reduce((acc, photo) => {
            const date = photo.shot_time;
            if (acc[date]) {
                acc[date].push(photo);
            } else {
                acc[date] = [photo];
            }
            return acc;
        }, {}));

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
            if (!firstDayOfMonth[`${year}-${month}`]) {
                firstDayOfMonth[`${year}-${month + 1}`] = date.format('YYYY-MM-DD');
            } else if (date.isBefore(moment(firstDayOfMonth[`${year}-${month}`]))) {
                firstDayOfMonth[`${year}-${month + 1}`] = date.format('YYYY-MM-DD');
            }
        }

        res.json({
            state: 'success',
            data: {
                items: groupByDate,
                firstDayOfYear,
                firstDayOfMonth,
                totalItems,
                collectionId,
            },
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const { date } = req.query;

        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({
                state: 'error',
                message: 'Invalid date format',
            });
        }

        const { hideInAlbum } = req.query;
        const filter = `is_deleted = false && shot_time >= '${moment(date, 'YYYY-MM-DD').startOf('day').utc().format('YYYY-MM-DD HH:mm:ss')
            }' && shot_time <= '${moment(date, 'YYYY-MM-DD').endOf('day').utc().format('YYYY-MM-DD HH:mm:ss')
            } ' ${hideInAlbum === 'true' ? ' && album = ""' : ''}`;
        let photos = await pb.collection('photos_entry_dimensions').getFullList({
            filter,
            expand: 'photo',
            fields: 'expand.photo.raw,is_in_album,expand.photo.id,expand.photo.image',
        });

        photos = photos.map((photo) => ({ ...photo.expand.photo, is_in_album: photo.is_in_album }));

        photos.forEach((photo) => {
            photo.has_raw = photo.raw !== '';
            delete photo.raw;
        });

        res.json({
            state: 'success',
            data: photos,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.get('/list/:albumId', async (req, res) => {
    try {
        const { pb } = req;
        const { albumId } = req.params;
        let photos = await pb.collection('photos_entry_dimensions').getFullList({
            filter: `photo.album = "${albumId}"`,
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
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.post('/import', async (req, res) => {
    try {
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
                    const dateStr = imageFiles[0].toUpperCase().match(/IMG-(?<date>\d+)-WA.+/).groups.date;
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
    } catch (error) {
        try {
            res.status(500).send({
                state: 'error',
                message: error.message,
            });
        } catch (e) {
            console.log(e);
        }
    }
});

router.get('/import/progress', (req, res) => {
    res.json({
        state: 'success',
        data: progress,
    });
});

router.delete('/delete', async (req, res) => {
    try {
        const { pb } = req;
        const { photos } = req.body;

        for (const photo of photos) {
            const dim = await pb.collection('photos_entry_dimensions').getOne(photo);

            if (dim.is_in_album) {
                const { album } = await pb.collection('photos_entry').getOne(dim.photo);
                await pb.collection('photos_album').update(album, {
                    'amount-': 1,
                });
                await pb.collection('photos_entry_dimensions').update(photo, {
                    is_deleted: true,
                    is_in_album: false,
                });
            }

            await pb.collection('photos_entry').update(dim.photo, {
                album: '',
            });
        }

        res.json({
            state: 'success',
            message: 'Photos have been deleted',
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

module.exports = router;
