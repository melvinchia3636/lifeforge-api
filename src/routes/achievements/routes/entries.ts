import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { success } from '../../../utils/response.js'
import { body, param } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IAchievementEntry } from '../../../interfaces/achievements_interfaces.js'

const router = express.Router()

router.get(
    '/:difficulty',
    param('difficulty')
        .isString()
        .isIn(['easy', 'medium', 'hard', 'impossible']),
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IAchievementEntry[]>>
        ) => {
            if (hasError(req, res)) return

            const { difficulty } = req.params

            await list<IAchievementEntry>(req, res, 'achievements_entries', {
                filter: `difficulty = "${difficulty}"`
            })
        }
    )
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
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IAchievementEntry>>
        ) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { difficulty, title, thoughts } = req.body

            const achievement: IAchievementEntry = await pb
                .collection('achievements_entries')
                .create({
                    difficulty,
                    title,
                    thoughts
                })

            success(res, achievement)
        }
    )
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
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return
        const { pb } = req
        const { id } = req.params
        const { difficulty, title, thoughts } = req.body

        const achievement: IAchievementEntry = await pb
            .collection('achievements_entries')
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
    [param('id').isString()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { id } = req.params

        await pb.collection('achievements_entries').delete(id)

        success(res)
    })
)

export default router
