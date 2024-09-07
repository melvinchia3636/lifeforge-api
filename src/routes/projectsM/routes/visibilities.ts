import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { successWithBaseResponse } from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { IProjectsMVisibility } from '../../../interfaces/projects_m_interfaces.js'
import { BaseResponse } from '../../../interfaces/base_response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMVisibility[]>>
        ) => list(req, res, 'projects_m_visibilities')
    )
)

router.post(
    '/',
    [body('name').isString(), body('icon').isString],
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMVisibility>>
        ) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, icon } = req.body

            const visibility: IProjectsMVisibility = await pb
                .collection('projects_m_visibilities')
                .create({
                    name,
                    icon
                })

            successWithBaseResponse(res, visibility)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMVisibility>>
        ) => {
            const { pb } = req
            const { id } = req.params
            const { name, icon } = req.body

            const visibility: IProjectsMVisibility = await pb
                .collection('projects_m_visibilities')
                .update(id, {
                    name,
                    icon
                })

            successWithBaseResponse(res, visibility)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('projects_m_visibilities').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
