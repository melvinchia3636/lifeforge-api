import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const category = await pb.collection('wallet_categories').getFullList()

        success(res, category)
    })
)

router.post(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, icon, color, type } = req.body

        if (!name || !icon || !color || !type) {
            clientError(res, 'Missing required fields')
            return
        }

        const category = await pb.collection('wallet_categories').create({
            name,
            icon,
            color,
            type
        })

        success(res, category)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

        if (!id || !name || !icon || !color) {
            clientError(res, 'Missing required fields')
            return
        }

        const category = await pb.collection('wallet_categories').update(id, {
            name,
            icon,
            color
        })

        success(res, category)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const category = await pb.collection('wallet_categories').delete(id)

        success(res, category)
    })
)

export default router
