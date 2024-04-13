/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import express from 'express';
import Pocketbase from 'pocketbase';

const router = express.Router();

function getWeekNumber(d) {
    d = new Date(d);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}

function getDateRangeFromWeekNumber(weekNumber, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    const firstDayOfWeek = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd));
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    return [firstDayOfWeek, lastDayOfWeek];
}

router.get('/list', async (req, res) => {
    try {
        const pb = new Pocketbase('http://api.lifeforge.thecodeblog.net:8090');
        const entries = await pb.collection('change_log_entry').getFullList();

        const final = [];

        for (const entry of entries) {
            const [year, week] = getWeekNumber(entry.created_at);
            const versionNumber = `${year.toString().slice(2)}w${week.toString().padStart(2, '0')}`;

            if (!final.find((item) => item.version === versionNumber)) {
                final.push({
                    version: versionNumber,
                    date_range: getDateRangeFromWeekNumber(week, year),
                    entries: [],
                });
            }

            final.find((item) => item.version === versionNumber).entries.push({
                id: entry.id,
                feature: entry.feature,
                description: entry.description,
            });
        }

        res.json({
            state: 'success',
            data: final.reverse(),
        });
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

export default router;
