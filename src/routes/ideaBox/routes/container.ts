import express, { Request, Response } from 'express'
import { successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import { list, validate } from '../../../utils/CRUD.js'
import { IIdeaBoxContainer } from '../../../interfaces/ideabox_interfaces.js'
import { BaseResponse } from '../../../interfaces/base_response.js'

const router = express.Router()

router.get(
    '/:id',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IIdeaBoxContainer>>
        ) => {
            const { pb } = req
            const { id } = req.params

            const container: IIdeaBoxContainer = await pb
                .collection('idea_box_containers')
                .getOne(id)

            successWithBaseResponse(res, container)
        }
    )
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req: Request, res: Response<boolean>) =>
        validate(req, res, 'idea_box_containers')
    )
)

router.get(
    '/',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IIdeaBoxContainer[]>>
        ) => list(req, res, 'idea_box_containers')
    )
)

router.post(
    '/',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IIdeaBoxContainer>>
        ) => {
            const { pb } = req
            const { name, color, icon } = req.body

            const container: IIdeaBoxContainer = await pb
                .collection('idea_box_containers')
                .create({
                    name,
                    color,
                    icon
                })

            successWithBaseResponse(res, container)
        }
    )
)

router.patch(
    '/:id',
    [
        body('name').isString().optional(),
        body('color').isHexColor().optional(),
        body('icon').isString().optional()
    ],
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IIdeaBoxContainer>>
        ) => {
            const { pb } = req
            const { id } = req.params

            const { name, color, icon } = req.body

            const container: IIdeaBoxContainer = await pb
                .collection('idea_box_containers')
                .update(id, {
                    name,
                    color,
                    icon
                })

            successWithBaseResponse(res, container)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('idea_box_containers').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
