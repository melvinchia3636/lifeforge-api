import express from 'express';
import { success } from '../../utils/response.js';
import asyncWrapper from '../../utils/asyncWrapper.js';

const { exec } = require('child_process');

const router = express.Router();

router.get('/stats', asyncWrapper(async (req, res) => {
    const { err, stdout, stderr } = exec('df -h');
    if (err) {
        throw new Error(err);
    }
    stdout.on('data', (data) => {
        const result = data
            .split('\n')
            .map((e) => e.split(' ')
                .filter((e) => e !== ''))
            .slice(1, -1)
            .filter((e) => e[8].startsWith('/Volumes'))
            .map((e) => ({
                name: e[8],
                size: e[1],
                used: e[2],
                avail: e[3],
                usedPercent: e[4],
            }));

        success(res, result);
    });

    stderr.on('data', (data) => {
        throw new Error(data);
    });
}));

export default router;
