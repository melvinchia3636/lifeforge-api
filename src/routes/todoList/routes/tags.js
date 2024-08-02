import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => list(req, res, 'todo_tags'))
)

router.post(
    '/',
    body('name').exists().notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { name } = req.body

        const tag = await pb.collection('todo_tags').create({
            name
        })

        success(res, tag)
    })
)

router.patch(
    '/:id',
    body('name').exists().notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { id } = req.params
        const { name } = req.body

        const tag = await pb.collection('todo_tags').update(id, {
            name
        })

        success(res, tag)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('todo_tags').delete(id)
        success(res)
    })
)

export default router
