import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/list/:difficulty',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const { difficulty } = req.params

        if (!['easy', 'medium', 'hard', 'impossible'].includes(difficulty)) {
            throw new Error('Invalid difficulty')
        }

        const achievements = await pb
            .collection('achievements_entry')
            .getFullList({
                filter: `difficulty="${difficulty}"`
            })

        success(res, achievements)
    })
)

router.post(
    '/create',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const { difficulty, title, thoughts } = req.body

        if (!['easy', 'medium', 'hard', 'impossible'].includes(difficulty)) {
            clientError(res, 'Invalid difficulty')
            return
        }

        if (!title || !thoughts) {
            clientError(res, 'Missing required fields')
            return
        }

        const achievement = await pb.collection('achievements_entry').create({
            difficulty,
            title,
            thoughts
        })

        success(res, achievement)
    })
)

router.patch(
    '/update/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const { id } = req.params
        const { difficulty, title, thoughts } = req.body

        if (!['easy', 'medium', 'hard', 'impossible'].includes(difficulty)) {
            clientError(res, 'Invalid difficulty')
            return
        }

        if (!title || !thoughts) {
            clientError(res, 'Missing required fields')
            return
        }

        const achievement = await pb
            .collection('achievements_entry')
            .update(id, {
                difficulty,
                title,
                thoughts
            })

        success(res, achievement)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const { id } = req.params

        await pb.collection('achievements_entry').delete(id)

        success(res)
    })
)

export default router
