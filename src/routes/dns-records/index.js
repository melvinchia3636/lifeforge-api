/* eslint-disable no-param-reassign */
import express from 'express';
import asyncWrapper from '../../utils/asyncWrapper.js';
import { success } from '../../utils/response.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const url = 'https://thecodeblog.net:2083/execute/DNS/parse_zone?zone=thecodeblog.net';
    const headers = {
        Authorization: 'cpanel thecodeb:D5T73BE6G1ESTNEATJI38M5ZLCJ055IM',
    };

    const response = await fetch(url, { headers });
    const raw = await response.json();
    const { data } = raw;

    data.forEach((record) => {
        if (Object.keys(record).includes('dname_b64')) {
            record.dname_b64 = atob(record.dname_b64);
        }

        if (Object.keys(record).includes('data_b64')) {
            record.data_b64 = record.data_b64.map((item) => atob(item));
        }

        if (Object.keys(record).includes('text_b64')) {
            record.text_b64 = atob(record.text_b64);
        }
    });

    success(res, data);
}));

export default router;
