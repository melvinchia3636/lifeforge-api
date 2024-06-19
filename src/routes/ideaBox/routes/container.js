import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'

const router = express.Router()

router.get(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const container = await pb.collection('idea_box_container').getOne(id)

        success(res, container)
    })
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const { totalItems } = await pb
            .collection('idea_box_container')
            .getList(1, 1, {
                filter: `id = "${id}"`
            })

        success(res, totalItems === 1)
    })
)

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const containers = await pb
            .collection('idea_box_container')
            .getFullList()

        success(res, containers)
    })
)

router.post(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, color, icon } = req.body

        const container = await pb.collection('idea_box_container').create({
            name,
            color,
            icon
        })

        success(res, container)
    })
)

router.patch(
    '/:id',
    [
        body('name').isString().optional(),
        body('color').isHexColor().optional(),
        body('icon').isString().optional()
    ],
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const { name, color, icon } = req.body

        await pb.collection('idea_box_container').update(id, {
            name,
            color,
            icon
        })

        success(res)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('idea_box_container').delete(id)

        success(res)
    })
)

export default router
