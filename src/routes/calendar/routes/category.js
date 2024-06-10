import express from 'express'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const categories = await pb
            .collection('calendar_category')
            .getFullList()
        success(res, categories)
    })
)

router.post(
    '/create',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, icon, color } = req.body

        if (!name || !icon || !color) {
            clientError(res, 'Missing required fields')
            return
        }

        const category = await pb.collection('calendar_category').create({
            name,
            icon,
            color
        })
        success(res, category)
    })
)

router.patch(
    '/update/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        if (!name || !icon || !color) {
            clientError(res, 'Missing required fields')
            return
        }

        const category = await pb.collection('calendar_category').update(id, {
            name,
            icon,
            color
        })

        success(res, category)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        await pb.collection('calendar_category').delete(id)
        success(res)
    })
)

export default router
