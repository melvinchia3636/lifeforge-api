import express, { Request, Response } from 'express'
import moment from 'moment'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { query } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import {
    ITodoListEntry,
    ITodoListStatusCounter,
    ITodoSubtask
} from '../../../interfaces/todo_list_interfaces.js'

const router = express.Router()

router.get(
    '/',
    query('status')
        .optional()
        .isIn(['all', 'today', 'scheduled', 'overdue', 'completed']),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListEntry[]>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const status = req.query.status || 'all'

            const filters = {
                all: 'done = false',
                today: `done = false && due_date >= "${moment()
                    .startOf('day')
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss')}" && due_date <= "${moment()
                    .endOf('day')
                    .utc()
                    .add(1, 'second')
                    .format('YYYY-MM-DD HH:mm:ss')}"`,
                scheduled: `done = false && due_date != "" && due_date >= "${moment()
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss')}"`,
                overdue: `done = false && due_date != "" && due_date < "${moment()
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss')}"`,
                completed: 'done = true'
            }

            let finalFilter = filters[status as keyof typeof filters]

            const { tag, list } = req.query
            if (tag) finalFilter += ` && tags ~ "${tag}"`
            if (list) finalFilter += ` && list = "${list}"`

            const entries: (ITodoListEntry & {
                expand?: { subtasks: ITodoSubtask[] }
            })[] = await pb.collection('todo_entries').getFullList({
                filter: finalFilter,
                expand: 'subtasks'
            })

            entries.forEach(entries => {
                if (entries.subtasks.length === 0) return

                entries.subtasks =
                    entries.expand?.subtasks.map((subtask: ITodoSubtask) => ({
                        title: subtask.title,
                        done: subtask.done,
                        id: subtask.id
                    })) ?? []

                delete entries.expand
            })

            successWithBaseResponse(res, entries)
        }
    )
)

router.get(
    '/status-counter',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<ITodoListStatusCounter>>
        ) => {
            const filters = {
                all: 'done = false',
                today: `done = false && due_date >= "${moment()
                    .startOf('day')
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss')}" && due_date <= "${moment()
                    .endOf('day')
                    .utc()
                    .add(1, 'second')
                    .format('YYYY-MM-DD HH:mm:ss')}"`,
                scheduled: `done = false && due_date != "" && due_date >= "${moment()
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss')}"`,
                overdue: `done = false && due_date != "" && due_date < "${moment()
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss')}"`,
                completed: 'done = true'
            }

            const { pb } = req

            const counters: ITodoListStatusCounter = {
                all: 0,
                today: 0,
                scheduled: 0,
                overdue: 0,
                completed: 0
            }

            for (const type of Object.keys(
                filters
            ) as (keyof typeof filters)[]) {
                const { totalItems } = await pb
                    .collection('todo_entries')
                    .getList(1, 1, {
                        filter: filters[type]
                    })

                counters[type] = totalItems
            }

            successWithBaseResponse(res, counters)
        }
    )
)

router.post(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListEntry>>) => {
            async function createSubtask() {
                if (!data.subtasks) return

                const subtasks = []

                for (const task of data.subtasks) {
                    if (!task.title) {
                        clientError(res, 'Subtask title is required')
                        return
                    }

                    const subtask: ITodoSubtask = await pb
                        .collection('todo_subtasks')
                        .create({
                            title: task.title
                        })

                    subtasks.push(subtask.id)
                }

                data.subtasks = subtasks
            }

            const { pb } = req
            const data = req.body

            await createSubtask()

            const entries: ITodoListEntry = await pb
                .collection('todo_entries')
                .create(data)

            if (entries.list) {
                await pb.collection('todo_lists').update(entries.list, {
                    'amount+': 1
                })
            }

            for (const tag of entries.tags) {
                await pb.collection('todo_tags').update(tag, {
                    'amount+': 1
                })
            }

            successWithBaseResponse(res, entries)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (
            req: Request,
            res: Response<
                BaseResponse<
                    Omit<ITodoListEntry, 'subtasks'> & {
                        subtasks: string[]
                    }
                >
            >
        ) => {
            const { pb } = req
            const { id } = req.params

            const originalentries: Omit<ITodoListEntry, 'subtasks'> & {
                subtasks: string[]
            } = await pb.collection('todo_entries').getOne(id)

            const { subtasks } = req.body

            for (const subtaskIndex in subtasks || []) {
                const subtask = subtasks[subtaskIndex]
                let newSubtask: ITodoSubtask | { id: null } = { id: null }

                if (subtask.id.startsWith('new-')) {
                    newSubtask = await pb
                        .collection('todo_subtasks')
                        .create({ title: subtask.title })
                } else if (subtask.hasChanged) {
                    await pb.collection('todo_subtasks').update(subtask.id, {
                        title: subtask.title
                    })
                }

                subtasks[subtaskIndex] = newSubtask.id || subtask.id
            }

            const entries: Omit<ITodoListEntry, 'subtasks'> & {
                subtasks: string[]
            } = await pb.collection('todo_entries').update(id, req.body)

            for (const list of [
                ...new Set([originalentries.list, entries.list])
            ]) {
                if (!list) continue

                const { totalItems } = await pb
                    .collection('todo_entries')
                    .getList(1, 1, {
                        filter: `list ~ "${list}"`
                    })

                await pb.collection('todo_lists').update(list, {
                    amount: totalItems
                })
            }

            for (const tag of [
                ...new Set([...originalentries.tags, ...entries.tags])
            ]) {
                if (!tag) continue

                const { totalItems } = await pb
                    .collection('todo_entries')
                    .getList(1, 1, {
                        filter: `tags ~ "${tag}"`
                    })

                await pb.collection('todo_tags').update(tag, {
                    amount: totalItems
                })
            }

            for (const subtask of originalentries.subtasks) {
                if (entries.subtasks.includes(subtask)) continue

                await pb.collection('todo_subtasks').delete(subtask)
            }

            successWithBaseResponse(res, entries)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        const entries: Omit<ITodoListEntry, 'subtasks'> & {
            subtasks: string[]
        } = await pb.collection('todo_entries').getOne(id)

        await pb.collection('todo_entries').delete(id)
        if (entries.list) {
            await pb.collection('todo_lists').update(entries.list, {
                'amount-': 1
            })
        }

        for (const tag of entries.tags) {
            await pb.collection('todo_tags').update(tag, {
                'amount-': 1
            })
        }

        for (const subtask of entries.subtasks) {
            await pb.collection('todo_subtasks').delete(subtask)
        }

        successWithBaseResponse(res)
    })
)

router.post(
    '/toggle/:id',
    asyncWrapper(
        async (
            req: Request,
            res: Response<
                BaseResponse<
                    Omit<ITodoListEntry, 'subtasks'> & {
                        subtasks: string[]
                    }
                >
            >
        ) => {
            const { pb } = req
            const { id } = req.params

            const entries: Omit<ITodoListEntry, 'subtasks'> & {
                subtasks: string[]
            } = await pb.collection('todo_entries').getOne(id)

            if (!entries.done) {
                for (const subtask of entries.subtasks) {
                    await pb.collection('todo_subtasks').update(subtask, {
                        done: true
                    })
                }
            }

            const entry: Omit<ITodoListEntry, 'subtasks'> & {
                subtasks: string[]
            } = await pb.collection('todo_entries').update(id, {
                done: !entries.done,
                completed_at: entries.done
                    ? null
                    : moment().utc().format('YYYY-MM-DD HH:mm:ss')
            })

            successWithBaseResponse(res, entry)
        }
    )
)

export default router
