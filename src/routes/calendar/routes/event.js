import express from 'express'
import { success, clientError } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const events = await pb.collection('calendar_event').getFullList()

        success(res, events)
    })
)

router.post(
    '/create',
    [
        body('title').exists().notEmpty(),
        body('start').exists().notEmpty(),
        body('end').exists().notEmpty()
    ],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { title, start, end, category } = req.body

        const events = await pb.collection('calendar_event').create({
            title,
            start,
            end,
            category: category || ''
        })

        if (category) {
            await pb.collection('calendar_category').update(category, {
                'amount+': 1
            })
        }

        success(res, events)
    })
)

router.patch(
    '/update/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { title, start, end, category } = req.body

        const oldEvent = await pb.collection('calendar_event').getOne(id)
        const events = await pb.collection('calendar_event').update(id, {
            title,
            start,
            end,
            category: category || ''
        })

        if (oldEvent.category !== category) {
            if (oldEvent.category) {
                await pb
                    .collection('calendar_category')
                    .update(oldEvent.category, {
                        'amount-': 1
                    })
            }

            if (category) {
                await pb.collection('calendar_category').update(category, {
                    'amount+': 1
                })
            }
        }

        success(res, events)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const event = await pb.collection('calendar_event').getOne(id)

        await pb.collection('calendar_event').delete(id)

        if (event.category) {
            await pb.collection('calendar_category').update(event.category, {
                'amount-': 1
            })
        }

        success(res)
    })
)

export default router
