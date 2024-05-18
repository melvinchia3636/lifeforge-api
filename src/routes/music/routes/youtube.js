import express from 'express';
import { exec } from 'child_process';
import { v4 } from 'uuid';
import { readFileSync, readdirSync, unlinkSync } from 'fs';
import asyncWrapper from '../../../utils/asyncWrapper.js';
import { clientError, success } from '../../../utils/response.js';

const router = express.Router();

let downloading = 'empty';

router.get('/get-info/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    exec(`yt-dlp --skip-download --print "title,upload_date,uploader,duration,view_count,like_count,thumbnail" "https://www.youtube.com/watch?v=${id}"`, (err, stdout, stderr) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const [title, uploadDate, uploader, duration, viewCount, likeCount, thumbnail] = stdout.split('\n');

        success(res, {
            title,
            uploadDate,
            uploader,
            duration,
            viewCount,
            likeCount,
            thumbnail,
        });
    });
}));

router.post('/async-download/:id', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const { metadata } = req.body;

    if (!metadata) {
        clientError(res, 'Metadata is required');
    }

    if (downloading === 'in_progress') {
        clientError(res, 'Already downloading');
        return;
    }

    downloading = 'in_progress';
    res.status(202).json({
        state: 'accepted',
        message: 'Download started',
    });
    const downloadID = v4();

    exec(`yt-dlp -f bestaudio -o "${process.cwd()}/uploads/${downloadID}-%(title)s.%(ext)s" --extract-audio --audio-format mp3 --audio-quality 0 "https://www.youtube.com/watch?v=${id}"`, async (err, stdout, stderr) => {
        if (err) {
            res.status(500).json({ error: err.message });
            downloading = 'failed';
            return;
        }

        const allFiles = readdirSync(`${process.cwd()}/uploads`);
        const mp3File = allFiles.find((file) => file.startsWith(downloadID));
        if (!mp3File) {
            downloading = 'failed';
            return;
        }

        const fileBuffer = readFileSync(`${process.cwd()}/uploads/${mp3File}`);

        await pb.collection('music_entry').create({
            name: metadata.title,
            author: metadata.uploader,
            duration: metadata.duration,
            file: new File([fileBuffer], mp3File.split('-').slice(1).join('-')),
        });

        unlinkSync(`${process.cwd()}/uploads/${mp3File}`);

        downloading = 'completed';
    });
}));

router.get('/download-status', asyncWrapper(async (req, res) => {
    success(res, { status: downloading });
}));

export default router;
