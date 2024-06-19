import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { success } from '../../../utils/response.js'
import { body, param } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/:difficulty',
    param('difficulty')
        .isString()
        .isIn(['easy', 'medium', 'hard', 'impossible']),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { difficulty } = req.params

        const achievements = await pb
            .collection('achievements_entry')
            .getFullList({
                filter: `difficulty="${difficulty}"`
            })

        success(res, achievements)
    })
)

router.post(
    '/',
    [
        body('difficulty')
            .exists()
            .isString()
            .isIn(['easy', 'medium', 'hard', 'impossible']),
        body('title').exists().notEmpty(),
        body('thoughts').exists().notEmpty()
    ],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { difficulty, title, thoughts } = req.body

        const achievement = await pb.collection('achievements_entry').create({
            difficulty,
            title,
            thoughts
        })

        success(res, achievement)
    })
)

router.patch(
    '/:id',
    [
        body('difficulty')
            .exists()
            .isString()
            .isIn(['easy', 'medium', 'hard', 'impossible']),
        body('title').exists().notEmpty(),
        body('thoughts').exists().notEmpty()
    ],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return
        const { pb } = req
        const { id } = req.params
        const { difficulty, title, thoughts } = req.body

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
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('achievements_entry').delete(id)

        success(res)
    })
)

export default router
