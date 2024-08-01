import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const categories = await pb.collection('todo_lists').getFullList()
        success(res, categories)
    })
)

router.post(
    '/',
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { name, icon, color } = req.body

        const category = await pb.collection('todo_lists').create({
            name,
            icon,
            color
        })
        success(res, category)
    })
)

router.patch(
    '/:id',
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

        const category = await pb.collection('todo_lists').update(id, {
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

        await pb.collection('todo_lists').delete(id)
        success(res)
    })
)

export default router
