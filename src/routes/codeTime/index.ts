// @ts-nocheck
import express, { Request, Response } from 'express'
import moment from 'moment'
import { clientError, successWithBaseResponse } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'

const router = express.Router()

Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf())
    date.setDate(date.getDate() + days)
    return date
}

function getDates(startDate, stopDate) {
    const dateArray = []
    let currentDate = startDate
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate))
        currentDate = currentDate.addDays(1)
    }
    return dateArray
}

router.get(
    '/activities',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const year = req.query.year || new Date().getFullYear()

        const data = await pb
            .collection('code_time_daily_entries')
            .getFullList({
                filter: `date >= "${year}-01-01 00:00:00.000Z" && date <= "${year}-12-31 23:59:59.999Z"`
            })

        const groupByDate = {}

        for (const item of data) {
            const dateKey = moment(item.date).format('YYYY-MM-DD')
            if (!groupByDate[dateKey]) {
                groupByDate[dateKey] = 0
            }
            groupByDate[dateKey] = item.total_minutes
        }

        const final = Object.entries(groupByDate).map(
            ([date, totalMinutes]) => ({
                date,
                count: totalMinutes,
                level: (() => {
                    const hours = totalMinutes / 60
                    if (hours < 1) {
                        return 1
                    }
                    if (hours >= 1 && hours < 3) {
                        return 2
                    }
                    if (hours >= 3 && hours < 5) {
                        return 3
                    }
                    return 4
                })()
            })
        )

        if (final[0].date !== `${year}-01-01`) {
            final.unshift({
                date: `${year}-01-01`,
                count: 0,
                level: 0
            })
        }

        if (final[final.length - 1].date !== `${year}-12-31`) {
            final.push({
                date: `${year}-12-31`,
                count: 0,
                level: 0
            })
        }

        const firstRecordEver = await pb
            .collection('code_time_daily_entries')
            .getList(1, 1, {
                sort: '+date'
            })

        successWithBaseResponse(res, {
            data: final,
            firstYear: +firstRecordEver.items[0].date
                .split(' ')[0]
                .split('-')[0]
        })
    })
)

router.get(
    '/statistics',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const everything = await pb
            .collection('code_time_daily_entries')
            .getFullList({
                sort: 'date'
            })

        let groupByDate = {}

        for (const item of everything) {
            const dateKey = moment(item.date).format('YYYY-MM-DD')
            groupByDate[dateKey] = item.total_minutes
        }

        groupByDate = Object.entries(groupByDate).map(([date, count]) => ({
            date,
            count
        }))

        groupByDate = groupByDate.sort((a, b) => {
            if (a.count > b.count) {
                return -1
            }
            if (a.count < b.count) {
                return 1
            }
            return 0
        })

        const mostTimeSpent = groupByDate[0].count
        const total = everything.reduce(
            (acc, curr) => acc + curr.total_minutes,
            0
        )
        const average = total / groupByDate.length

        groupByDate = groupByDate.sort((a, b) => a.date.localeCompare(b.date))

        const allDates = groupByDate.map(item => item.date)

        const longestStreak = (() => {
            let streak = 0
            let longest = 0

            const firstDate = new Date(allDates[0])
            const lastDate = new Date(allDates[allDates.length - 1])

            const dates = getDates(firstDate, lastDate)

            for (const date of dates) {
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                if (allDates.includes(dateKey)) {
                    streak += 1
                } else {
                    if (streak > longest) {
                        longest = streak
                    }
                    streak = 0
                }
            }
            return longest
        })()

        groupByDate = groupByDate.reverse()

        const currentStreak = (() => {
            let streak = 0

            const firstDate = new Date(allDates[0])
            const lastDate = new Date(allDates[allDates.length - 1])

            const dates = getDates(firstDate, lastDate).reverse()

            for (const date of dates) {
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                if (!allDates.includes(dateKey)) break

                streak += 1
            }
            return streak
        })()

        successWithBaseResponse(res, {
            'Most time spent': mostTimeSpent,
            'Total time spent': total,
            'Average time spent': average,
            'Longest streak': Math.max(longestStreak, currentStreak),
            'Current streak': currentStreak
        })
    })
)

router.get(
    '/projects',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const lastXDays = req.query.last

        if (!['24 hours', '7 days', '30 days'].includes(lastXDays)) {
            clientError(
                res,
                'lastXDays must be one of 24 hours, 7 days, 30 days'
            )
            return
        }

        const date = moment()
            .subtract(
                ...({
                    '24 hours': [24, 'hours'],
                    '7 days': [7, 'days'],
                    '30 days': [30, 'days']
                }[lastXDays] || [7, 'days'])
            )
            .format('YYYY-MM-DD')

        const data = await pb
            .collection('code_time_daily_entries')
            .getFullList({
                filter: `date >= "${date} 00:00:00.000Z"`
            })

        const projects = data.map(item => item.projects)

        let groupByProject = {}

        for (const item of projects) {
            for (const project in item) {
                if (!groupByProject[project]) {
                    groupByProject[project] = 0
                }
                groupByProject[project] += item[project]
            }
        }

        groupByProject = Object.fromEntries(
            Object.entries(groupByProject).sort(([, a], [, b]) => b - a)
        )

        successWithBaseResponse(res, groupByProject)
    })
)

router.get(
    '/languages',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const lastXDays = req.query.last

        if (!['24 hours', '7 days', '30 days'].includes(lastXDays)) {
            clientError(
                res,
                'lastXDays must be one of 24 hours, 7 days, 30 days'
            )
            return
        }

        const date = moment()
            .subtract(
                ...({
                    '24 hours': [24, 'hours'],
                    '7 days': [7, 'days'],
                    '30 days': [30, 'days']
                }[lastXDays] || [7, 'days'])
            )
            .format('YYYY-MM-DD')

        const data = await pb
            .collection('code_time_daily_entries')
            .getFullList({
                filter: `date >= "${date} 00:00:00.000Z"`
            })

        const languages = data.map(item => item.languages)

        let groupByLanguage = {}

        for (const item of languages) {
            for (const language in item) {
                if (!groupByLanguage[language]) {
                    groupByLanguage[language] = 0
                }
                groupByLanguage[language] += item[language]
            }
        }

        groupByLanguage = Object.fromEntries(
            Object.entries(groupByLanguage).sort(([, a], [, b]) => b - a)
        )

        successWithBaseResponse(res, groupByLanguage)
    })
)

router.get(
    '/each-day',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const lastDay = moment().format('YYYY-MM-DD')

        // 30 days before today
        const firstDay = moment().subtract(30, 'days').format('YYYY-MM-DD')

        const data = await pb
            .collection('code_time_daily_entries')
            .getFullList({
                filter: `date >= "${firstDay} 00:00:00.000Z" && date <= "${lastDay} 23:59:59.999Z"`
            })

        const groupByDate = {}

        for (const item of data) {
            const dateKey = moment(item.date).format('YYYY-MM-DD')
            groupByDate[dateKey] = item.total_minutes
        }

        successWithBaseResponse(
            res,
            Object.entries(groupByDate).map(([date, item]) => ({
                date,
                duration: item * 1000 * 60
            }))
        )
    })
)

router.get(
    '/user/minutes',
    asyncWrapper(async (req: Request, res: Response) => {
        try {
            const { pb } = req
            // first day of current month
            const { minutes } = req.query
            const minTime = moment()
                .subtract(+minutes, 'minutes')
                .format('YYYY-MM-DD')

            const items = await pb
                .collection('code_time_daily_entries')
                .getList(1, 1, {
                    filter: `date >= "${minTime}"`
                })

            res.json({
                minutes:
                    items.totalItems > 0
                        ? items.items.reduce(
                              (acc, item) => acc + item.total_minutes,
                              0
                          )
                        : 0
            })
        } catch (e) {
            console.log(e)
            res.status(500)
            res.send({
                state: 'error',
                message: e.message
            })
        }
    })
)

router.post(
    '/eventLog',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const data = req.body

        data.eventTime = Math.floor(Date.now() / 60000) * 60000

        const date = moment(data.eventTime).format('YYYY-MM-DD')

        const lastData = await pb
            .collection('code_time_daily_entries')
            .getList(1, 1, {
                filter: `date~"${date}"`
            })

        if (lastData.totalItems === 0) {
            await pb.collection('code_time_daily_entries').create({
                date,
                projects: {
                    [data.project]: 1
                },
                relative_files: {
                    [data.relativeFile]: 1
                },
                languages: {
                    [data.language]: 1
                },
                total_minutes: 1,
                last_timestamp: data.eventTime
            })
        } else {
            const lastRecord = lastData.items[0]

            if (data.eventTime === lastRecord.last_timestamp) {
                res.send({
                    status: 'ok',
                    data: [],
                    message: 'success'
                })
                return
            }

            const projects = lastRecord.projects
            if (projects[data.project]) {
                projects[data.project] += 1
            } else {
                projects[data.project] = 1
            }

            const relativeFiles = lastRecord.relative_files
            if (relativeFiles[data.relativeFile]) {
                relativeFiles[data.relativeFile] += 1
            } else {
                relativeFiles[data.relativeFile] = 1
            }

            const languages = lastRecord.languages
            if (languages[data.language]) {
                languages[data.language] += 1
            } else {
                languages[data.language] = 1
            }

            await pb
                .collection('code_time_daily_entries')
                .update(lastRecord.id, {
                    projects,
                    relative_files: relativeFiles,
                    languages,
                    total_minutes: lastRecord.total_minutes + 1,
                    last_timestamp: data.eventTime
                })
        }

        res.send({
            status: 'ok',
            data: [],
            message: 'success'
        })
    })
)

export default router
