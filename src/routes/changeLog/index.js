/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import express from 'express';
import Pocketbase from 'pocketbase';
import moment from 'moment';
import { success } from '../../utils/response.js';
import asyncWrapper from '../../utils/asyncWrapper.js';

const router = express.Router();

router.get('/list', asyncWrapper(async (req, res) => {
    const pb = new Pocketbase('http://192.168.0.117:8090');
    const entries = await pb.collection('change_log_entry').getFullList();

    const final = [];

    for (const entry of entries) {
        const m = moment(entry.created_at);
        const [year, week] = [m.year(), m.week()];
        const versionNumber = `${year.toString().slice(2)}w${week.toString().padStart(2, '0')}`;

        if (!final.find((item) => item.version === versionNumber)) {
            final.push({
                version: versionNumber,
                date_range: [m.startOf('week').toISOString(), m.endOf('week').toISOString()],
                entries: [],
            });
        }

        final.find((item) => item.version === versionNumber).entries.push({
            id: entry.id,
            feature: entry.feature,
            description: entry.description,
        });
    }

    success(res, final.reverse());
}));

export default router;
