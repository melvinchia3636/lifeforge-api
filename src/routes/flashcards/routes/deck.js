import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entry = await pb.collection('flashcards_deck').getOne(id)

        success(res, entry)
    })
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const { totalItems } = await pb
            .collection('flashcards_deck')
            .getList(1, 1, {
                filter: `id = "${id}"`
            })

        success(res, totalItems === 1)
    })
)

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const entries = await pb.collection('flashcards_deck').getFullList({
            expand: 'tag'
        })

        success(res, entries)
    })
)

export default router
