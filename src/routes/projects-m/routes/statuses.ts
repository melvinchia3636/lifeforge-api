import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IProjectsMStatus } from '../../../interfaces/projects_m_interfaces.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IProjectsMStatus[]>>) =>
            list(req, res, 'projects_m_statuses')
    )
)

router.post(
    '/',
    [
        body('name').isString(),
        body('icon').isString(),
        body('color').isHexColor()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IProjectsMStatus>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, icon, color } = req.body

            const status: IProjectsMStatus = await pb
                .collection('projects_m_statuses')
                .create({
                    name,
                    icon,
                    color
                })

            successWithBaseResponse(res, status)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IProjectsMStatus>>) => {
            const { pb } = req
            const { id } = req.params
            const { name, icon, color } = req.body

            const status: IProjectsMStatus = await pb
                .collection('projects_m_statuses')
                .update(id, {
                    name,
                    icon,
                    color
                })

            successWithBaseResponse(res, status)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('projects_m_statuses').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
