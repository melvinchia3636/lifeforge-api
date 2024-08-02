import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import validate from '../../../utils/validate.js'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('flashcards_decks').getOne(id)

        success(res, entries)
    })
)

router.get('/valid/:id', validate('flashcards_decks'))

router.get(
    '/list',
    asyncWrapper(async (req, res) =>
        list(req, res, 'flashcards_decks', {
            expand: 'tag'
        })
    )
)

export default router
