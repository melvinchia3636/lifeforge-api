import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { successWithBaseResponse } from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IProjectsMCategory } from '../../../interfaces/projects_m_interfaces.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMCategory[]>>
        ) => list(req, res, 'projects_m_categories')
    )
)

router.post(
    '/',
    [body('name').isString(), body('icon').isString()],
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMCategory>>
        ) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, icon } = req.body

            const category: IProjectsMCategory = await pb
                .collection('projects_m_categories')
                .create({
                    name,
                    icon
                })

            successWithBaseResponse(res, category)
        }
    )
)

router.patch(
    '/:id',
    [body('name').isString(), body('icon').isString()],
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMCategory>>
        ) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name, icon } = req.body

            const category: IProjectsMCategory = await pb
                .collection('projects_m_categories')
                .update(id, {
                    name,
                    icon
                })

            successWithBaseResponse(res, category)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('projects_m_categories').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
