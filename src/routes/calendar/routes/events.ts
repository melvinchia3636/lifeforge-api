import express, { Request, Response } from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import { ICalendarEvent } from '../../../interfaces/calendar_interfaces.js'
import { BaseResponse } from '../../../interfaces/base_response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ICalendarEvent[]>>) =>
            list<ICalendarEvent>(req, res, 'calendar_events')
    )
)

router.post(
    '/',
    [
        body('title').exists().notEmpty(),
        body('start').exists().notEmpty(),
        body('end').exists().notEmpty()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ICalendarEvent>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { title, start, end, category } = req.body

            const events: ICalendarEvent = await pb
                .collection('calendar_events')
                .create({
                    title,
                    start,
                    end,
                    category: category || ''
                })

            if (category) {
                await pb.collection('calendar_categories').update(category, {
                    'amount+': 1
                })
            }

            success(res, events)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ICalendarEvent>>) => {
            const { pb } = req
            const { id } = req.params
            const { title, start, end, category } = req.body

            const oldEvent = await pb.collection('calendar_events').getOne(id)
            const events: ICalendarEvent = await pb
                .collection('calendar_events')
                .update(id, {
                    title,
                    start,
                    end,
                    category: category || ''
                })

            if (oldEvent.category !== category) {
                if (oldEvent.category) {
                    await pb
                        .collection('calendar_categories')
                        .update(oldEvent.category, {
                            'amount-': 1
                        })
                }

                if (category) {
                    await pb
                        .collection('calendar_categories')
                        .update(category, {
                            'amount+': 1
                        })
                }
            }

            success(res, events)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        const event = await pb.collection('calendar_events').getOne(id)

        await pb.collection('calendar_events').delete(id)

        if (event.category) {
            await pb.collection('calendar_categories').update(event.category, {
                'amount-': 1
            })
        }

        success(res)
    })
)

export default router
