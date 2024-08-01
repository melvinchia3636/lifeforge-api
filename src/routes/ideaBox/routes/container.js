import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import validate from '../../../common/validate.js'

const router = express.Router()

router.get(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const container = await pb.collection('idea_box_containers').getOne(id)

        success(res, container)
    })
)

router.get('/valid/:id', validate('idea_box_containers'))

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const containers = await pb
            .collection('idea_box_containers')
            .getFullList()

        success(res, containers)
    })
)

router.post(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, color, icon } = req.body

        const container = await pb.collection('idea_box_containers').create({
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

        await pb.collection('idea_box_containers').update(id, {
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

        await pb.collection('idea_box_containers').delete(id)

        success(res)
    })
)

export default router
