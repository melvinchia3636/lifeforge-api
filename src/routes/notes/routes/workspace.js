import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const category = await pb
            .collection('notes_workspace')
            .getOne(req.params.id)

        success(res, category)
    })
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const { totalItems } = await pb
            .collection('notes_workspace')
            .getList(1, 1, {
                filter: `id = "${req.params.id}"`
            })

        success(res, totalItems === 1)
    })
)

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const categories = await pb.collection('notes_workspace').getFullList()

        success(res, categories)
    })
)

export default router
