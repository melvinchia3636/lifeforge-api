import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { body, param, validationResult } from 'express-validator'

const router = express.Router()

router.get(
    '/list/:difficulty',
    param('difficulty')
        .isString()
        .isIn(['easy', 'medium', 'hard', 'impossible']),
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

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
    '/create',
    [
        body('difficulty')
            .exists()
            .isString()
            .isIn(['easy', 'medium', 'hard', 'impossible']),
        body('title').exists().notEmpty(),
        body('thoughts').exists().notEmpty()
    ],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

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
    '/update/:id',
    [
        body('difficulty')
            .exists()
            .isString()
            .isIn(['easy', 'medium', 'hard', 'impossible']),
        body('title').exists().notEmpty(),
        body('thoughts').exists().notEmpty()
    ],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }
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
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('achievements_entry').delete(id)

        success(res)
    })
)

export default router
