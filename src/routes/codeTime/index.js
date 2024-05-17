/* eslint-disable indent */
/* eslint-disable no-shadow */
/* eslint-disable no-extend-native */
/* eslint-disable no-restricted-syntax */
import express from 'express';
import moment from 'moment';
import { clientError, success } from '../../utils/response.js';
import asyncWrapper from '../../utils/asyncWrapper.js';

const router = express.Router();

Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function getDates(startDate, stopDate) {
    const dateArray = [];
    let currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

router.get('/activities', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const year = req.query.year || new Date().getFullYear();

    const firstDayOfYear = new Date();
    firstDayOfYear.setMonth(0);
    firstDayOfYear.setDate(1);
    firstDayOfYear.setHours(0);
    firstDayOfYear.setMinutes(0);
    firstDayOfYear.setSeconds(0);
    firstDayOfYear.setFullYear(year);

    const lastDayOfYear = new Date();
    lastDayOfYear.setMonth(11);
    lastDayOfYear.setDate(31);
    lastDayOfYear.setHours(23);
    lastDayOfYear.setMinutes(59);
    lastDayOfYear.setSeconds(59);
    lastDayOfYear.setFullYear(year);

    const data = await pb.collection('code_time').getFullList({
        sort: 'event_time',
        filter: `event_time >= ${firstDayOfYear.getTime()} && event_time <= ${lastDayOfYear.getTime()}`,
    });

    const groupByDate = {};

    for (const item of data) {
        const date = new Date(item.event_time);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!groupByDate[dateKey]) {
            groupByDate[dateKey] = [];
        }
        groupByDate[dateKey].push(item);
    }

    const final = Object.entries(groupByDate).map(([date, items]) => ({
        date,
        count: items.length,
        level: (() => {
            const hours = items.length / 60;
            if (hours < 1) {
                return 1;
            } if (hours >= 1 && hours < 3) {
                return 2;
            } if (hours >= 3 && hours < 5) {
                return 3;
            }
            return 4;
        })(),
    }));

    if (final[0].date !== `${firstDayOfYear.getFullYear()
        }-${String(firstDayOfYear.getMonth() + 1).padStart(2, '0')
        }-${String(firstDayOfYear.getDate()).padStart(2, '0')}`) {
        final.unshift({
            date: `${firstDayOfYear.getFullYear()
                }-${String(firstDayOfYear.getMonth() + 1).padStart(2, '0')
                }-${String(firstDayOfYear.getDate()).padStart(2, '0')}`,
            count: 0,
            level: 0,
        });
    }

    if (final[final.length - 1].date !== `${lastDayOfYear.getFullYear()
        }-${String(lastDayOfYear.getMonth() + 1).padStart(2, '0')
        }-${String(lastDayOfYear.getDate()).padStart(2, '0')}`) {
        final.push({
            date: `${lastDayOfYear.getFullYear()
                }-${String(lastDayOfYear.getMonth() + 1).padStart(2, '0')
                }-${String(lastDayOfYear.getDate()).padStart(2, '0')}`,
            count: 0,
            level: 0,
        });
    }

    const firstRecordEver = await pb.collection('code_time').getList(1, 1, {
        sort: '+event_time',
    });

    success(res, {
        data: final,
        firstYear: new Date(firstRecordEver.items[0].event_time).getFullYear(),
    });
}));

router.get('/statistics', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const everything = await pb.collection('code_time').getFullList({
        sort: 'event_time',
    });

    let groupByDate = {};

    for (const item of everything) {
        const date = new Date(item.event_time);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!groupByDate[dateKey]) {
            groupByDate[dateKey] = 0;
        }
        groupByDate[dateKey] += 1;
    }

    groupByDate = Object.entries(groupByDate).map(([date, count]) => ({
        date,
        count,
    }));

    groupByDate = groupByDate.sort((a, b) => {
        if (a.count > b.count) {
            return -1;
        } if (a.count < b.count) {
            return 1;
        }
        return 0;
    });

    const mostTimeSpent = groupByDate[0].count;
    const total = everything.length;
    const average = total / groupByDate.length;

    groupByDate = groupByDate.sort((a, b) => a.date.localeCompare(b.date));

    const allDates = groupByDate.map((item) => item.date);

    const longestStreak = (() => {
        let streak = 0;
        let longest = 0;

        const firstDate = new Date(allDates[0]);
        const lastDate = new Date(allDates[allDates.length - 1]);

        const dates = getDates(firstDate, lastDate);

        for (const date of dates) {
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (allDates.includes(dateKey)) {
                streak += 1;
            } else {
                if (streak > longest) {
                    longest = streak;
                }
                streak = 0;
            }
        }
        return longest;
    })();

    groupByDate = groupByDate.reverse();

    const currentStreak = (() => {
        let streak = 0;

        const firstDate = new Date(allDates[0]);
        const lastDate = new Date(allDates[allDates.length - 1]);

        const dates = getDates(firstDate, lastDate).reverse();

        for (const date of dates) {
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (allDates.includes(dateKey)) {
                streak += 1;
            } else {
                break;
            }
        }
        return streak;
    })();

    success(res, {
        'Most time spent': mostTimeSpent,
        'Total time spent': total,
        'Average time spent': average,
        'Longest streak': longestStreak,
        'Current streak': currentStreak,
    });
}));

router.get('/projects', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const lastXDays = req.query.last || '24 hours';

    if (parseInt(lastXDays, 10) > 30) {
        clientError(res, 'lastXDays must be less than 30');
        return;
    }

    const date = new Date();
    switch (lastXDays) {
        case '24 hours':
            date.setHours(date.getHours() - 24);
            date.setMinutes(0);
            date.setSeconds(0);
            break;
        case '7 days':
            date.setDate(date.getDate() - 7);
            break;
        case '30 days':
            date.setDate(date.getDate() - 30);
            break;
        default:
            date.setDate(date.getDate() - 7);
            break;
    }

    const data = await pb.collection('code_time').getFullList({
        filter: `event_time >= ${date.getTime()}`,
    });

    let groupByProject = {};

    for (const item of data) {
        if (!groupByProject[item.project]) {
            groupByProject[item.project] = 0;
        }
        groupByProject[item.project] += 1;
    }

    groupByProject = Object.fromEntries(
        Object.entries(groupByProject).sort(([, a], [, b]) => b - a),
    );

    success(res, groupByProject);
}));

router.get('/languages', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const lastXDays = req.query.last || '24 hours';

    if (lastXDays > 30) {
        res.status(400)
            .send({
                state: 'error',
                message: 'lastXDays must be less than 30',
            });
        return;
    }

    const date = new Date();
    switch (lastXDays) {
        case '24 hours':
            date.setHours(date.getHours() - 24);
            date.setMinutes(0);
            date.setSeconds(0);
            break;
        case '7 days':
            date.setDate(date.getDate() - 7);
            break;
        case '30 days':
            date.setDate(date.getDate() - 30);
            break;
        default:
            date.setDate(date.getDate() - 7);
            break;
    }

    const data = await pb.collection('code_time').getFullList({
        filter: `event_time >= ${date.getTime()}`,
    });

    let groupByLanguage = {};

    for (const item of data) {
        if (!groupByLanguage[item.language]) {
            groupByLanguage[item.language] = 0;
        }
        groupByLanguage[item.language] += 1;
    }

    groupByLanguage = Object.fromEntries(
        Object.entries(groupByLanguage).sort(([, a], [, b]) => b - a),
    );

    success(res, groupByLanguage);
}));

router.get('/each-day', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const lastDay = new Date();
    lastDay.setHours(23);
    lastDay.setMinutes(59);
    lastDay.setSeconds(59);

    // 30 days before today
    const firstDay = new Date();
    firstDay.setDate(lastDay.getDate() - 30);
    firstDay.setHours(0);
    firstDay.setMinutes(0);
    firstDay.setSeconds(0);

    const data = await pb.collection('code_time').getFullList({
        sort: 'event_time',
        filter: `event_time >= ${firstDay.getTime()} && event_time <= ${lastDay.getTime()}`,
    });

    const groupByDate = {};

    for (const item of data) {
        const date = new Date(item.event_time);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!groupByDate[dateKey]) {
            groupByDate[dateKey] = [];
        }
        groupByDate[dateKey].push(item);
    }

    success(res, Object.entries(groupByDate).map(([date, items]) => ({
        date,
        duration: items.length * 1000 * 60,
    })));
}));

router.get('/user/minutes', asyncWrapper(async (req, res) => {
    try {
        const { pb } = req;
        // first day of current month
        const { minutes } = req.query;
        const minTime = moment().subtract(+minutes, 'minutes').valueOf();

        const { totalItems } = await pb.collection('code_time').getList(1, 1, {
            sort: 'event_time',
            filter: `event_time >= ${minTime}`,
        });

        res.json({
            minutes: totalItems,
        });
    } catch (e) {
        console.log(e);
        res.status(500);
        res.send({
            state: 'error',
            message: e.message,
        });
    }
}));

router.post('/eventLog', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const data = req.body;

    data.eventTime = Math.floor(Date.now() / 60000) * 60000;

    const lastData = await pb.collection('code_time').getList(1, 1, {
        sort: 'event_time',
        filter: `event_time = ${data.eventTime}`,
    });

    if (lastData.totalItems === 0) {
        pb.collection('code_time').create({
            project: data.project,
            language: data.language,
            event_time: data.eventTime,
            relative_file: data.relativeFile,
        });

        const language = await pb.collection('code_time_languages').getList(1, 1, {
            sort: 'name',
            filter: `name = '${data.language}'`,
        });

        if (language.totalItems === 0) {
            pb.collection('code_time_languages').create({
                name: data.language,
                duration: 1,
            });
        } else {
            pb.collection('code_time_languages').update(language.items[0].id, {
                duration: language.items[0].duration + 1,
            });
        }

        const project = await pb.collection('code_time_projects').getList(1, 1, {
            sort: 'name',
            filter: `name = '${data.project}'`,
        });

        if (project.totalItems === 0) {
            pb.collection('code_time_projects').create({
                name: data.project,
                duration: 1,
            });
        } else {
            pb.collection('code_time_projects').update(project.items[0].id, {
                duration: project.items[0].duration + 1,
            });
        }
    }

    res.send({
        status: 'ok',
        data: [],
        message: 'success',
    });
}));

export default router;
