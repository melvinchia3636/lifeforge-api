import express from 'express'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body, validationResult } from 'express-validator'

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
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { name, icon, color } = req.body

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
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

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

        await pb.collection('calendar_category').delete(id)
        success(res)
    })
)

export default router
